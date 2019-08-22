import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Dimensions,
  View,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-elements';
import firebase from 'react-native-firebase';
import PhoneNumberInput from '../components/PhoneNumberInput';
import CountrySelector from '../components/CountrySelector';
import GradientButton from '../components/GradientButton';
// Assets & Data
import flagCollection from '../assets/flags/index';
import countryData from '../assets/countryData';
import { createUserinDB } from '../actions/authActions';
// Style
const { width } = Dimensions.get('window');
const pillWidth = width * 0.88;
const pillFontSize = pillWidth / 20;

const PhoneNumberScreen = props => {
  // Initial State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState({
    name: 'United States of America',
    alpha2Code: 'us',
    callingCode: 1,
  });
  const [popupVisibility, setPopupVisibility] = useState(false);
  const [flag, setFlag] = useState(flagCollection[country.alpha2Code]);
  const [message, setMessage] = useState(''); // TO DO integrate into error
  const [isLoading, setIsLoading] = useState(null);
  const [listenerOff, setListenerOff] = useState(null);

  // Event Handlers
  const handleFlagTouch = () => setPopupVisibility(true);
  const handleSubmitButtonPress = () => {
    signIn();
  };

  const signIn = () => {
    setMessage('Sending code ...');
    firebase
      .auth()
      .signInWithPhoneNumber(`+${country.callingCode}${phoneNumber}`)
      .then(confirmation => {
        setIsLoading(true);
        setListenerOff(true);
        setMessage('Code has been sent!');
        props.navigation.navigate('codeEntry', {
          confirmResult: confirmation,
          phoneNumber,
        });
      })
      .catch(error => setMessage(error.message));
  };

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (user && !listenerOff) {
        // Handling Auto-verification for android
        // User will only exist in this screen if it is same user
        createUserinDB(user, props);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
      console.log('unmounted from PhoneNumberScreen');
    };
  }, [listenerOff]);

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.indicator}>
          <ActivityIndicator size="large" color="orangered" />
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.viewOne}>
            <Text style={{ fontSize: 36, color: '#606060' }}>My number is</Text>
          </View>
          <View style={styles.viewTwo}>
            <PhoneNumberInput
              style={styles.phoneNumberInput}
              handleFlagTouch={handleFlagTouch}
              callingCode={country.callingCode}
              flag={flag}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
            />
            <CountrySelector
              setFlag={setFlag}
              countryData={countryData}
              popupVisibility={popupVisibility}
              setCountry={setCountry}
              setPopupVisibility={setPopupVisibility}
              flagCollection={flagCollection}
            />
            <Text style={styles.text}>
              When you tap Verify SMS, BholiSession will send a text with a
              verification code. Message and data rates may apply. The verified
              phone number can be used to login.
            </Text>
          </View>
          <View style={styles.viewThree}>
            <GradientButton
              onPress={handleSubmitButtonPress}
              title="Get SMS Code"
            />
            <Text style={{ marginTop: 10, fontSize: 12, paddingLeft: 20 }}>
              {message}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default PhoneNumberScreen;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  viewOne: {
    paddingTop: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    height: '100%',
    width: '100%',
    flex: 0.25,
    paddingLeft: 20,
    marginBottom: 10,
  },
  viewTwo: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    height: '100%',
    width: '100%',
    flex: 0.8,
    paddingLeft: 20,
    paddingRight: 15,
    paddingTop: 10,
  },
  viewThree: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    flex: 3,
    paddingTop: 50,
  },
  phoneNumberInput: {
    marginTop: 50,
    fontSize: pillFontSize,
  },
  text: {
    marginTop: 20,
    fontSize: 12,
    color: 'grey',
  },
  indicator: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
});
