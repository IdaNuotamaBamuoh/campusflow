
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
Platform, SafeAreaView, StatusBar, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Colors } from '../../components/colors';
import { supabase } from '../../backend/supabase';


const SignUpScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [firstname, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [studentemail, setStudentEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    // Basic input check
    if (!firstname || !surname || !studentemail || !password || !confirmpassword) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }
    if (password !== confirmpassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    const { data: {user}, error } = await supabase.auth.signUp({
      email: studentemail,
      password,
    });
        
    if (error) {
      Alert.alert('Sign Up failed', error.message);
      setLoading(false);
      return;
    }
    if (password !== confirmpassword) {
      Alert.alert('Passwords do not match')
      setLoading (false)
      return;
    }

    const { error: insertError,  } = await supabase
      .from('stdprofile')
      .upsert([
        {
          id: user?.id,
          fname: firstname,
          lname: surname,
          stdmail: studentemail
        }
      ]);

      setLoading(false);

      if (insertError) {
        Alert.alert('Sign Up failed', insertError.message);
        setLoading(false)
      } else {
        if (navigation && navigation.replace && Platform.OS !== 'web') {
          Alert.alert('Sign Up successful');
          Alert.alert('Success', `Welcome to CAMPUSFLOW, ${firstname}!
            Please confirm your email to complete the registration.`);
          navigation.replace('MapScreen');
        }}
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0}
      >
        
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >

        <View style={styles.titleContainer}>
          <Text style={[styles.title, {fontWeight: 500}]}>Sign Up to</Text>
          <Text style={styles.title}>CAMPUSFLOW</Text>
        </View>

        <View style={{display: 'flex', justifyContent: 'center'}} >
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your first name"
            value={firstname}
            onChangeText={setFirstName}
            placeholderTextColor="#ccc"
          />
          <Text style={styles.label}>Surname</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your surname"
            value={surname}
            onChangeText={setSurname}
            placeholderTextColor="#ccc"
          />
          <Text style={styles.label}>Student Email</Text>
          <TextInput
            style={styles.input}
            placeholder="example@st.knust.edu.gh"
            value={studentemail}
            onChangeText={setStudentEmail}
            keyboardType="email-address"
            autoCapitalize="none"
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
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter password"
            value={confirmpassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#ccc"
          />

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>

          <View>
            <Text style={{color: Colors.colorTheme, fontSize: 16, textAlign: 'center', marginTop: 20}}>
              Already have an account? <Text style={{fontWeight: 'bold'}}
              onPress={() => navigation.navigate('Signin')}>
                Log In</Text>
            </Text>
          </View>

          {Platform.OS === 'web' && (
            <Text style={{color: 'red', marginTop: 20, textAlign: 'center'}}>
              MapScreen is not available on web. Please use a mobile device or emulator.
            </Text>
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    padding: 20,
    marginTop: StatusBar.currentHeight
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

export default SignUpScreen;