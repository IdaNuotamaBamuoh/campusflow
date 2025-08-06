import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../../backend/supabase';

const DriverMapScreen = ({ route }) => {
  const { driverId } = route.params; // ✅ Passed from login screen
  const [location, setLocation] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  const initialRegion = {
    latitude: 6.6731,
    longitude: -1.5718,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // ✅ Fetch driver info using eid
  useEffect(() => {
    const fetchDriverInfo = async () => {
      try {
        const { data: driverData, error } = await supabase
          .from('driverprofile')
          .select('*')
          .eq('id', driverId)
          .single();

        if (error || !driverData) {
          Alert.alert('Error', 'Driver record not found');
          setLoading(false);
          return;
        }

        setDriver(driverData);
      } catch (err) {
        console.error('Error fetching driver info:', err);
        Alert.alert('Error', 'Something went wrong while fetching driver info.');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverInfo();
  }, [driverId]);

  // ✅ Get location permission & initial position
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required.');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  // ✅ Update driver location every 5 seconds
  useEffect(() => {
    if (!location || !driver) return;

    const interval = setInterval(async () => {
      if (driverId) {
        const { error } = await supabase
          .from('driverprofile') // or 'drivers' if that's your tracking table
          .update({
            latitude: location.latitude,
            longitude: location.longitude,
          })
          .eq('id', driverId);

        if (error) {
          console.error('Error updating location:', error);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [location, driver]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#29722F" />
        <Text>Loading driver info...</Text>
      </View>
    );
  }

  if (!driver) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>Driver data not found.</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#29722F" />
        <Text>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title={driver.name}
          description={`Route: ${driver.route}`}
        />
      </MapView>
    </View>
  );
};

export default DriverMapScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
