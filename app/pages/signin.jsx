import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, SafeAreaView, StatusBar, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useState } from 'react'
import React from 'react'
import { Colors } from '../../components/colors'

const Signin = ({ navigation }) => {
    const [studentemail, setStudentEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = () => {
        // Basic input check
        if (!studentemail || !password) {
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
    <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={{flex: 1}}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0}
        >
            <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, {fontWeight: 500}]}>Sign In to</Text>
                    <Text style={styles.title}>CAMPUSFLOW</Text>
                </View>

                <View style={{display: 'flex', justifyContent: 'center'}}>
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

                    <View style={{alignSelf: 'flex-end', marginTop: -10}}>
                        <Text style={{color: Colors.colorTheme, fontSize: 16, textAlign: 'center', marginBottom: 10, fontWeight: 'bold'}}
                            onPress={() => navigation.navigate('')}
                        >
                            Forgot Password?
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                        <Text style={styles.buttonText}>Sign In</Text>
                    </TouchableOpacity>

                    <View>
                        <Text style={{color: Colors.colorTheme, fontSize: 16, textAlign: 'center', marginTop: 20}}>
                            Don't have an account? <Text style={{fontWeight: 'bold'}}
                            onPress={() => navigation.navigate('Signup')}>
                            Sign Up</Text>
                        </Text>
                    </View>
                </View>
            </ScrollView>

        </KeyboardAvoidingView>
      
    </SafeAreaView>
  )
}

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
})
export default Signin