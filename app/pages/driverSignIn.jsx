
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { Colors } from '../../components/colors';


const DriverSignIn = ({ navigation }) => {
  const [firstname, setFirstName] = useState('');
  const [eid, setEid] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');

  const handleSignIn = () => {
    // Basic input check
    if ( !eid || !password) {
      Alert.alert('Error', 'Please fill out all fields');
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
    <ScrollView contentContainerStyle={styles.container}>

      <View >
        <View style={styles.titleContainer}>
          <Text style={[styles.title, {fontWeight: 500}]}>Sign In to</Text>
          <Text style={styles.title}>CAMPUSFLOW</Text>
        </View>

        <Text style={styles.label}>Employee ID</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your employee ID"
          value={eid}
          onChangeText={setEid}
          placeholderTextColor="#ccc"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#ccc"
        />

        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        {Platform.OS === 'web' && (
          <Text style={{color: 'red', marginTop: 20, textAlign: 'center'}}>
            MapScreen is not available on web. Please use a mobile device or emulator.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  titleContainer: {
    marginVertical: 30,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    flexDirection: 'row'
  },
  title: {
    fontSize: 28,
    color: Colors.colorTheme,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderColor: Colors.colorTheme,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: Colors.colorTheme,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    color: Colors.secondaryBackground,
    fontWeight: 600,
    marginBottom: 10
  }
});

export default DriverSignIn;