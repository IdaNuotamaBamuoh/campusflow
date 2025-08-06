import React, { useCallback, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, TextInput, Image } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Modalize } from 'react-native-modalize';
import polyline from '@mapbox/polyline';
import { GOOGLE_MAPS_API_KEY } from '../../env';
import Toast from 'react-native-toast-message';
import routesData from '../../assets/data/routes.json';
import busStopsData from '../../assets/data/busStops.json';
import { supabase } from '../../backend/supabase';

const CarTrackingMapScreen = () => {
  const sheetRef = useRef(null);
  const mapRef = useRef(null);
  const snapTimeoutRef = useRef(null);

  const [roadRoutes, setRoadRoutes] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchValue, setSearchValue] = useState('');

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

  useEffect(() => {
    sheetRef.current?.open();
  }, []);

  useEffect(() => {
    const fetchDrivers = async () => {
      const { data, error } = await supabase.from('driverprofile').select('*');
      if (error) console.error('Error fetching drivers:', error);
      if (data) setDrivers(data);
    };
    fetchDrivers();

    const subscription = supabase
      .channel('drivers-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'driverprofile' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setDrivers((prev) =>
              prev.map((d) => (d.id === payload.new.id ? payload.new : d))
            );
          } else if (payload.eventType === 'INSERT') {
            setDrivers((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'DELETE') {
            setDrivers((prev) => prev.filter((d) => d.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

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

  const handleDriverTap = (driver) => {
    setSelectedDriver(driver);
    sheetRef.current?.open('top'); // expands modal fully
  };

  const getDriverIcon = (color) => {
    switch (color) {
      case 'red':
        return require('../../assets/images/busLocations/bus_red.png');
      case 'blue':
        return require('../../assets/images/busLocations/bus_blue.png');
      case 'green':
        return require('../../assets/images/busLocations/bus_green.png');
      case 'yellow':
        return require('../../assets/images/busLocations/bus_yellow.png');
      case 'orange':
        return require('../../assets/images/busLocations/bus_orange.png');
    }
  };

  const filteredBusStops = busStopsData.filter((stop) =>
    stop.name.toLowerCase().includes(searchValue.toLowerCase())
  );

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
        scrollEnabled
        zoomEnabled
        pitchEnabled={false}
        rotateEnabled={false}
        provider={PROVIDER_GOOGLE}
      >
        {/* Bus Stops */}
        {busStopsData.map((stop) => (
          <Marker
            key={stop.name}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            title={stop.name}
            pinColor="#29722F"
          />
        ))}

        {/* Other Routes */}
        {Object.keys(roadRoutes).map((routeKey) =>
          selectedDriver && selectedDriver.route === routeKey ? null : (
            <Polyline
              key={routeKey}
              coordinates={roadRoutes[routeKey]}
              strokeColor="#007AFF"
              strokeWidth={5}
              zIndex={10}
            />
          )
        )}

        {/* Selected Route */}
        {selectedDriver && roadRoutes[selectedDriver.route] && (
          <Polyline
            coordinates={roadRoutes[selectedDriver.route]}
            strokeColor={selectedDriver.color || '#FF0000'}
            strokeWidth={6}
            zIndex={100}
          />
        )}

        {/* Drivers with custom icons */}
        {drivers
          .filter((driver) => driver.latitude && driver.longitude)
          .map((driver) => (
            <Marker
              key={driver.id}
              coordinate={{
                latitude: driver.latitude,
                longitude: driver.longitude,
              }}
              title={driver.name}
              description={`Route: ${driver.route}`}
              onPress={() => handleDriverTap(driver)}
            >
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Image
                  source={getDriverIcon(driver.color)}
                  style={{ width: 40, height: 40 }} // ✅ Adjust size here
                  resizeMode="contain"
                />
              </View>
            </Marker>
          ))}
      </MapView>

      {/* Modalize */}
      <Modalize
        ref={sheetRef}
        alwaysOpen={100}
        snapPoint={400}
        modalHeight={500}
        handleStyle={styles.handleIndicator}
        adjustToContentHeight={false}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.header}>Where do you want to go?</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter bus stop name..."
            value={searchValue}
            onChangeText={setSearchValue}
            onFocus={() => sheetRef.current?.open()}
          />

          <Text style={styles.header}>🚘 Trip Info</Text>
          {selectedDriver ? (
            <>
              <Text style={styles.driverInfo}>Driver: {selectedDriver.name}</Text>
              <Text style={styles.driverInfo}>Route: {selectedDriver.route}</Text>
            </>
          ) : (
            <Text style={{ fontStyle: 'italic' }}>Tap a driver to view details</Text>
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
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  driverInfo: {
    fontSize: 16,
    marginVertical: 4,
  },
});

export default CarTrackingMapScreen;
