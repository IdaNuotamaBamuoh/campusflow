// FlashScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Animated } from 'react-native';


const FlashScreen = ({ navigation }) => {

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('LandingPage'); // Redirect after delay
    }, 3000); // Duration in ms

    return () => clearTimeout(timer);
  }, [navigation]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, // Target opacity
      duration: 2000, // Duration in ms (change to your desired span)
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);


  return (
    <View style={styles.container}>
      <View style={{width: '70%', alignItems: 'center', marginBottom: 20}}>
        <Animated.Image
          source={require('../.././assets/images/campusFlow2a.png')}
          style={[styles.logo, { opacity: fadeAnim }]}
        />
      </View>
      
      {/*<Text style={styles.logo}><Text style={{color: 'black', fontFamily: 'BGBold_Italic',fontSize:50 }}>CAMPUS</Text>
      <Text style={{color: '#DDEF3D',fontSize:25}}>FLOW</Text></Text>*/}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor:/* '#29722F'*/ '#ffffff',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: 170,
    marginBottom: 20,
    
  },
});

export default FlashScreen;