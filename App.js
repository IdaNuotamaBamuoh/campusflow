// App.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FlashScreen from './app/pages/splash';
import MainApp from './app/pages/signup'; // Your actual app screen
import { useFonts } from 'expo-font';
import MapScreen from './app/pages/map'; // Import your map screen
import DriverSignIn from './app/pages/driverSignIn'; // Import driver sign-in screen
import DriverMapScreen from './app/pages/driverMapScreen'; // Import driver map screen
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import SignUpScreen from './app/pages/signup';
import Signin from './app/pages/signin';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    BGBold_Italic: require('./assets/fonts/brandon grotesque font/Brandon_Grotesque_Bold_Italic.otf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="FlashScreen" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="FlashScreen" component={FlashScreen} />
            <Stack.Screen name="MainApp" component={MainApp} />
            <Stack.Screen name="MapScreen" component={MapScreen} />
            <Stack.Screen name="DriverSignIn" component={DriverSignIn} />
            <Stack.Screen name="DriverMapScreen" component={DriverMapScreen} />
            <Stack.Screen name="Signup" component={SignUpScreen} />
            <Stack.Screen name="Signin" component={Signin} />
          </Stack.Navigator>
        </NavigationContainer>
      <Toast />
    </GestureHandlerRootView>
  );
}