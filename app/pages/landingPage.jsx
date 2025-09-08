import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, SafeAreaView, StatusBar } from 'react-native';
import { Colors } from '../../components/colors';
import { supabase } from '../../backend/supabase';
import { useEffect } from 'react';

const LandingPage = ({ navigation }) => {
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // Fetch current session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session check error:', error.message);
          return;
        }

        if (data?.session) {
          console.log('User already logged in:', data.session.user);

          // If user exists, redirect to MapMenu
          if (navigation && navigation.replace) {
            navigation.replace('MapMenu');
          }
        } else {
          console.log('No active session found');
        }
      } catch (err) {
        console.error('Error checking session:', err);
      }
    };

    checkUserSession();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Sign In As</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#444', marginTop: 20 }]}
        onPress={() => navigation.navigate('DriverSignIn')}
      >
        <Text style={styles.buttonText}>A Driver</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: Colors.colorTheme, marginTop: 20 }]}
        onPress={() => navigation.navigate('Signin')}
      >
        <Text style={styles.buttonText}>A Student</Text>
      </TouchableOpacity>
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
  }
});

export default LandingPage;
