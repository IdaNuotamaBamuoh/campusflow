import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Button, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../../backend/supabase';
import Toast from 'react-native-toast-message';
import polyline from '@mapbox/polyline';
import { GOOGLE_MAPS_API_KEY } from '../../env';
import routesData from '../../assets/data/routes.json';
import busStopsData from '../../assets/data/busStops.json';

const DriverMapScreen = ({ route }) => {
  const { driverId } = route.params; // Get driverId from route params
  const [location, setLocation] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roadRoutes, setRoadRoutes] = useState({});
  const [isActive, setIsActive] = useState(true); // <-- NEW state for active/unavailable

  const mapRef = useRef(null);
  const snapTimeoutRef = useRef(null);

  const initialRegion = {
    latitude: 6.6731,
    longitude: -1.5718,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const knustBounds = {
    north: { latitude: 6.6891, longitude: -1.5640 },
    south: { latitude: 6.6600, longitude: -1.5650 },
    east: { latitude: 6.6775, longitude: -1.5400 },
    west: { latitude: 6.6775, longitude: -1.5900 },
  };

  const isInsideKnust = (region) => {
    const { latitude, longitude } = region;
    return (
      latitude >= knustBounds.south.latitude &&
      latitude <= knustBounds.north.latitude &&
      longitude >= knustBounds.west.longitude &&
      longitude <= knustBounds.east.longitude
    );
  };

  const handleRegionChange = useCallback((region) => {
    if (!isInsideKnust(region)) {
      if (snapTimeoutRef.current) return;

      Toast.show({
        type: 'info',
        text1: 'Out of bounds',
        text2: 'Re-centering to KNUST campus in 5 seconds...',
        visibilityTime: 4000,
      });

      snapTimeoutRef.current = setTimeout(() => {
        mapRef.current?.animateToRegion(initialRegion, 1000);
        snapTimeoutRef.current = null;
      }, 5000);
    } else {
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
        snapTimeoutRef.current = null;
      }
    }
  }, []);

  // Fetch driver info using id
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

  // Get location permission & initial position
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

  // Toggle driver status
  const toggleStatus = async () => {
    try {
      const newStatus = !isActive;
      setIsActive(newStatus);

      if (newStatus) {
        // ACTIVE: Update with current location
        await supabase
          .from('driverprofile')
          .update({
            latitude: location.latitude,
            longitude: location.longitude,
            status: 'Active',
          })
          .eq('id', driverId);
      } else {
        // UNAVAILABLE: Set location to NULL
        await supabase
          .from('driverprofile')
          .update({
            latitude: null,
            longitude: null,
            status: 'Unavailable',
          })
          .eq('id', driverId);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      Alert.alert('Error', 'Failed to toggle status.');
    }
  };

  // Update driver location every 5 seconds (only if ACTIVE)
  useEffect(() => {
    if (!location || !driver|| !isActive) return;

    const interval = setInterval(async () => {
      if (driverId && isActive) {
        const { error } = await supabase
          .from('driverprofile')
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
  }, [location, driver, isActive]);

  // Fetch road routes
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not found');
      return;
    }

    Object.entries(routesData).forEach(async ([key, coords]) => {
      if (!coords || coords.length < 2) return;
      const origin = `${coords[0].latitude},${coords[0].longitude}`;
      const destination = `${coords[coords.length - 1].latitude},${coords[coords.length - 1].longitude}`;
      const waypoints = coords
        .slice(1, -1)
        .map((coord) => `${coord.latitude},${coord.longitude}`)
        .join('|');

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}${
        waypoints ? `&waypoints=${waypoints}` : ''
      }&key=${GOOGLE_MAPS_API_KEY}&mode=driving`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes && data.routes.length) {
          const points = polyline.decode(data.routes[0].overview_polyline.points);
          const routeCoords = points.map(([latitude, longitude]) => ({ latitude, longitude }));
          setRoadRoutes((prev) => ({ ...prev, [key]: routeCoords }));
        }
      } catch (e) {
        console.error(`Failed to fetch Google Directions route for ${key}`, e);
      }
    });
  }, []);

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
      {/* Toggle Button */}
      <View style={{ position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10, border: '2px solid #0d0d0dff', backgroundColor: 'grey', borderRadius: 8,opacity: 0.6 }}>
        <Button
          title={isActive ? 'Go Unavailable' : 'Go Active'}
          onPress={toggleStatus}
          color={isActive ? 'red' : 'green'}
        />
      </View>

      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={handleRegionChange}
        minDelta={0.005}
        maxDelta={0.03}
        minZoomLevel={14.4}
        maxZoomLevel={19}
        scrollEnabled
        zoomEnabled
        pitchEnabled={false}
        rotateEnabled={false}
        showsUserLocation
        provider={PROVIDER_GOOGLE}
      >
        {busStopsData.map((stop) => (
          <Marker
            key={stop.name}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            title={stop.name}
            pinColor="#29722F"
          />
        ))}

        {Object.keys(roadRoutes).map((routeKey) => (
          <Polyline
            key={routeKey}
            coordinates={roadRoutes[routeKey]}
            strokeColor="#007AFF"
            strokeWidth={5}
          />
        ))}

        {isActive && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={driver.name}
            description={`Route: ${driver.route}`}
          />
        )}
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
