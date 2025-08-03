// App.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FlashScreen from './assets/pages/splash';
import MainApp from './assets/pages/signup'; // Your actual app screen
import { useFonts } from 'expo-font';
import MapScreen from './assets/pages/map'; // Import your map screen
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}