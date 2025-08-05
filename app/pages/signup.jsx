
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { ScrollView } from 'react-native-web';


const SignUpScreen = ({ navigation }) => {
  const [firstname, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [studentemail, setStudentEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');

  const handleSignUp = () => {
    // Basic input check
    if (!firstname || !surname || !studentemail || !password || !confirmpassword) {
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
      navigation.replace('MapScreen'); // Navigate to the main app screen after sign up
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up to CAMPUSFLOW</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstname}
        onChangeText={setFirstName}
        placeholderTextColor="#ccc"
      />
      <TextInput
        style={styles.input}
        placeholder="Surname"
        value={surname}
        onChangeText={setSurname}
        placeholderTextColor="#ccc"
      />
      <TextInput
        style={styles.input}
        placeholder="Student Email"
        value={studentemail}
        onChangeText={setStudentEmail}
        keyboardType="email-address"
        autoCapitalize="none"
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

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      <View>
        <Text style={{color: '#29722F', fontSize: 16, textAlign: 'center', marginTop: 20}}>
          Already have an account? <Text style={{fontWeight: 'bold'}}
          onPress={() => navigation.navigate('')}>
            Log In</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#444', marginTop: 20 }]}
        onPress={() => navigation.navigate('DriverSignIn')}
      >
        <Text style={styles.buttonText}>Sign In as Driver</Text>
      </TouchableOpacity>

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

export default SignUpScreen;