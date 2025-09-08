import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import FlashScreen from './app/pages/splash';
import MainApp from './app/pages/signup';
import { useFonts } from 'expo-font';
import MapScreen from './app/pages/map';
import DriverSignIn from './app/pages/driverSignIn';
import DriverMapScreen from './app/pages/driverMapScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import SignUpScreen from './app/pages/signup';
import Signin from './app/pages/signin';
import LandingPage from './app/pages/landingPage';
import About from './app/pages/aboutScreen';
import CarTrackingMapScreen from './app/pages/map';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './components/colors';
import { supabase } from './backend/supabase';
import { Alert } from 'react-native';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const handleLogout = async (navigation) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    Alert.alert('Logged out', 'You have been logged out successfully.');
    navigation.replace('Signin');
  } catch (error) {
    console.error('Logout error:', error.message);
    Alert.alert('Error', error.message);
  }
};

function MapMenuNavigator({ navigation }) {
  return (
    <Drawer.Navigator screenOptions={{headerStyle: { backgroundColor: Colors.colorTheme },headerTintColor: '#fff',drawerActiveTintColor: '#29722F',drawerLabelStyle: { fontSize: 16 }}}>
      <Drawer.Screen name="Routes" component={CarTrackingMapScreen} options={{drawerIcon: ({ color, size }) => (<Ionicons name="map-outline" size={size} color={color} />)}} />
      <Drawer.Screen name="About" component={About} options={{drawerIcon: ({ color, size }) => (<Ionicons name="information-circle-outline" size={size} color={color} />)}} />
      <Drawer.Screen name="Logout" component={() => null} options={{drawerIcon: ({ color, size }) => (<Ionicons name="log-out-outline" size={size} color={color} />)}} listeners={{drawerItemPress: (e) => {e.preventDefault();handleLogout(navigation);}}} />
    </Drawer.Navigator>
  );
}

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
          <Stack.Screen name="LandingPage" component={LandingPage} />
          <Stack.Screen name="Signin" component={Signin} />
          <Stack.Screen name="DriverSignIn" component={DriverSignIn} />
          <Stack.Screen name="MainApp" component={MainApp} />
          <Stack.Screen name="MapMenu" component={MapMenuNavigator} />
          <Stack.Screen name="DriverMapScreen" component={DriverMapScreen} options={{headerShown: true,headerTitle: 'Driver Map',headerStyle: { backgroundColor: Colors.colorTheme },headerTintColor: '#fff'}} />
          <Stack.Screen name="Signup" component={SignUpScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </GestureHandlerRootView>
  );
}
