import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, SafeAreaView, StatusBar, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Colors } from '../../components/colors';

const LandingPage = ({ navigation }) => {
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

export default LandingPage