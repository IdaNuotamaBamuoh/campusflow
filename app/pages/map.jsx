import React, { useCallback, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Modalize } from 'react-native-modalize';
import polyline from '@mapbox/polyline';
import { GOOGLE_MAPS_API_KEY } from '../../env';
import Toast from 'react-native-toast-message';
import routesData from '../../assets/data/routes.json'; // ✅ Import routes JSON
import busStopsData from '../../assets/data/busStops.json'; // ✅ Import bus stops JSON
import { supabase } from '../../assets/backend/supabase';

const CarTrackingMapScreen = () => {
  const sheetRef = useRef(null);
  const mapRef = useRef(null);
  const snapTimeoutRef = useRef(null);

  const [roadRoutes, setRoadRoutes] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);

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
    const latMin = knustBounds.south.latitude;
    const latMax = knustBounds.north.latitude;
    const lonMin = knustBounds.west.longitude;
    const lonMax = knustBounds.east.longitude;
    return latitude >= latMin && latitude <= latMax &&
           longitude >= lonMin && longitude <= lonMax;
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

  useEffect(() => {
    sheetRef.current?.open();
  }, []);

  // ✅ Fetch drivers from Supabase
  useEffect(() => {
    const fetchDrivers = async () => {
      const { data } = await supabase.from('driverprofile').select('*');
      setDrivers(data);
    };
    fetchDrivers();

    const subscription = supabase
      .channel('drivers-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driverprofile' }, (payload) => {
        setDrivers((prev) =>
          prev.map((d) => (d.id === payload.new.id ? payload.new : d))
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // ✅ Fetch Google Directions for routes
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not found');
      return;
    }

    Object.entries(routesData).forEach(async ([key, coords]) => {
      if (!coords || coords.length < 2) return;
      const origin = `${coords[0].latitude},${coords[0].longitude}`;
      const destination = `${coords[coords.length - 1].latitude},${coords[coords.length - 1].longitude}`;
      const waypoints = coords.slice(1, -1)
        .map(coord => `${coord.latitude},${coord.longitude}`)
        .join('|');

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}&key=${GOOGLE_MAPS_API_KEY}&mode=driving`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes && data.routes.length) {
          const points = polyline.decode(data.routes[0].overview_polyline.points);
          const routeCoords = points.map(([latitude, longitude]) => ({ latitude, longitude }));
          setRoadRoutes(prev => ({ ...prev, [key]: routeCoords }));
        }
      } catch (e) {
        console.error(`Failed to fetch Google Directions route for ${key}`, e);
      }
    });
  }, []);

  const handleDriverTap = (driver) => {
    setSelectedDriver(driver);
    sheetRef.current?.open();
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>
          Map and trip info are only available on mobile (iOS/Android). Please use a mobile device or emulator.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={handleRegionChange}
        minDelta={0.005}
        maxDelta={0.03}
        minZoomLevel={14.4}
        maxZoomLevel={19}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={false}
        rotateEnabled={false}
        provider={PROVIDER_GOOGLE}
      >
        {/* ✅ Bus Stops from JSON */}
        {busStopsData.map((stop) => (
          <Marker
            key={stop.name}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            title={stop.name}
            pinColor="#29722F"
          />
        ))}

        {/* ✅ Polylines */}
        {Object.keys(roadRoutes).map((routeKey) => (
          <Polyline
            key={routeKey}
            coordinates={roadRoutes[routeKey]}
            strokeColor="#007AFF"
            strokeWidth={5}
          />
        ))}

        {/* ✅ Drivers */}
        {drivers.map(driver => (
          <Marker
            key={driver.id}
            coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}
            title={driver.name}
            description={`Route: ${driver.route}`}
            onPress={() => handleDriverTap(driver)}
          />
        ))}
      </MapView>

      {/* Modalize */}
      <Modalize
        ref={sheetRef}
        modalHeight={400}
        handleStyle={styles.handleIndicator}
        adjustToContentHeight={false}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.header}>🚘 Trip Info</Text>
          {selectedDriver ? (
            <>
              <Text>📍 Driver: {selectedDriver.name}</Text>
              <Text>🛣 Route: {selectedDriver.route}</Text>
              <Text>⏱ ETA: 8 mins</Text>
            </>
          ) : (
            <Text>No driver selected</Text>
          )}
        </View>
      </Modalize>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  sheetContent: { padding: 20, backgroundColor: '#f5f5f5', flexGrow: 1 },
  handleIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 8,
  },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});

export default CarTrackingMapScreen;
