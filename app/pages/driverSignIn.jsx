
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { ScrollView } from 'react-native-web';


const DriverSignIn = ({ navigation }) => {
  const [firstname, setFirstName] = useState('');
  const [eid, setEid] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');

  const handleSignIn = () => {
    // Basic input check
    if ( !eid || !password || !confirmpassword) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }
    if (password !== confirmpassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Add backend logic here (e.g. Firebase, server API)
    Alert.alert('Success', `Welcome to CAMPUSFLOW, ${firstname}!`);
    // Only navigate to MapScreen on native platforms
    if (navigation && navigation.replace && Platform.OS !== 'web') {
      navigation.replace('DriverMapScreen', {
      driverName: firstname || 'Driver',
});
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up to CAMPUSFLOW</Text>

      
      <TextInput
        style={styles.input}
        placeholder="Employee ID"
        value={eid}
        onChangeText={setEid}
        placeholderTextColor="#ccc"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#ccc"
      />
       <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmpassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholderTextColor="#ccc"
      />

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <View>
        <Text style={{color: '#29722F', fontSize: 16, textAlign: 'center', marginTop: 20}}>
          Student? <Text style={{fontWeight: 'bold'}}>Log In Here</Text>
        </Text>
      </View>

      {Platform.OS === 'web' && (
        <Text style={{color: 'red', marginTop: 20, textAlign: 'center'}}>
          MapScreen is not available on web. Please use a mobile device or emulator.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#29722F',
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderColor: '#29722F',
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#29722F',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DriverSignIn;