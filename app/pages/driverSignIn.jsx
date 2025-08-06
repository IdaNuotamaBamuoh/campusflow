import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { Colors } from '../../components/colors';
import { supabase } from '../../backend/supabase';
import bcrypt from 'bcryptjs';

const DriverSignIn = ({ navigation }) => {
  const [eid, setEid] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!eid || !password) {
      Alert.alert('Error', 'Please enter Employee ID and Password');
      return;
    }

    setLoading(true);

    try {
      // Fetch driver by Employee ID
      const { data: driver, error } = await supabase
        .from('driverprofile')
        .select('*')
        .eq('eid', eid)
        .single();

      if (error || !driver) {
        Alert.alert('Error', 'Invalid Employee ID');
        setLoading(false);
        return;
      }

      if (!driver.password) {
        Alert.alert('Error', 'Password is missing in database for this user');
        setLoading(false);
        return;
      }

      // Compare password using bcrypt
      const isPasswordValid = driver.password === password;

      if (!isPasswordValid) {
        Alert.alert('Error', 'Incorrect password');
        setLoading(false);
        return;
      }

      // ✅ Successful login
      Alert.alert('Success', `Welcome back, ${driver.name || 'Driver'}!`);

      // Navigate to DriverMapScreen
      if (navigation && navigation.replace && Platform.OS !== 'web') {
        navigation.replace('DriverMapScreen', {
          driverId: driver.id,
          eid: driver.eid,
          driverName: driver.name,
          assignedRoute: driver.route || 'ksbToCommercial',
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert('Error', 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { fontWeight: '500' }]}>Log In to</Text>
          <Text style={styles.title}>CAMPUSFLOW</Text>
        </View>

        <Text style={styles.label}>Employee ID</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your Employee ID"
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

        <View style={{alignSelf: 'flex-end', marginTop: -10}}>
            <Text style={{color: Colors.colorTheme, fontSize: 16, textAlign: 'center', marginBottom: 10, fontWeight: 'bold'}}
                onPress={() => navigation.navigate('')}
            >
                Forgot Password?
            </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
        </TouchableOpacity>

        {Platform.OS === 'web' && (
          <Text style={{ color: 'red', marginTop: 20, textAlign: 'center' }}>
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
    flexDirection: 'row',
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
    fontWeight: '600',
    marginBottom: 10,
  },
});

export default DriverSignIn;
