import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, SafeAreaView, StatusBar, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useState } from 'react'
import React from 'react'
import { Colors } from '../../components/colors'

const About = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
    >
        <View style={{marginBottom: 20}}>
            <Text style={styles.title}>About Campus Flow</Text>
            <Text style={styles.paragraph}>
                Campus Flow is designed to help students, drivers, and staff easily track campus shuttle
                and bus routes in real-time. Whether you’re heading to class, the library, or the dorms, 
                our app ensures you know exactly where your ride is.
            </Text> 
        </View>
        <View style={{marginBottom: 20}}>
            <Text style={styles.title}>Key Features</Text>
            <Text style={styles.listItem}>• Live bus tracking with accurate GPS updates</Text>
            <Text style={styles.listItem}>• Search for nearby bus stops</Text>
            <Text style={styles.listItem}>• View driver details and assigned routes</Text>
            <Text style={styles.listItem}>• Easy-to-use interface for all campus members</Text>
        </View>
        <View style={{marginBottom: 20}}>
            <Text style={styles.title}>Our Mission</Text>
            <Text style={styles.paragraph}>
                To improve transportation efficiency on campus, reduce wait times, and make commuting 
                stress-free for students and staff.
            </Text>
        </View>
        <Text style={styles.footer}>Version 1.0.0</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginTop: StatusBar.currentHeight,
        flexGrow: 1,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: Colors.colorTheme,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 8,
        color: Colors.colorTheme,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 22,
    },
    listItem: {
        fontSize: 16,
        marginBottom: 5,
        paddingLeft: 10,
    },
    footer: {
        fontSize: 14,
        marginTop: 30,
        color: '#888',
        textAlign: 'center',
    },
})
export default About