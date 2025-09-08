import React, { useCallback, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, TextInput, Image, KeyboardAvoidingView, SafeAreaView, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { Modalize } from 'react-native-modalize';
import polyline from '@mapbox/polyline';
import { GOOGLE_MAPS_API_KEY } from '../../env';
import Toast from 'react-native-toast-message';
import routesData from '../../assets/data/routes.json';
import busStopsData from '../../assets/data/busStops.json';
import { supabase } from '../../backend/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const CarTrackingMapScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
   // Navigation for opening drawer
  const sheetRef = useRef(null);
  const mapRef = useRef(null);
  const snapTimeoutRef = useRef(null);

  const [roadRoutes, setRoadRoutes] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);

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

  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setKeyboardOffset(event.endHeight);
        // Open modal to top when keyboard appears
        sheetRef.current?.open('top');
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardOffset(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleDriverTap = (driver) => {
    setSelectedDriver(driver);
    sheetRef.current?.open('top');
  };

  const handleBusStopTap = (stop) => {
    setSearchValue(stop.name);
    setSelectedDestination(stop);
    // Optionally animate to the bus stop location
    mapRef.current?.animateToRegion({
      latitude: stop.latitude,
      longitude: stop.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 1000);
    // Close the sheet to show more of the map
    sheetRef.current?.open();
  };

  const handleSearch = () => {
    if (selectedDestination) {
      Toast.show({
        type: 'success',
        text1: 'Destination Set',
        text2: `Navigating to ${selectedDestination.name}`,
        visibilityTime: 3000,
      });
      // Add your search/navigation logic here
      console.log('Searching for route to:', selectedDestination);
    } else {
      Toast.show({
        type: 'error',
        text1: 'No Destination Selected',
        text2: 'Please select a bus stop first',
        visibilityTime: 3000,
      });
    }
  };

  const clearSearch = () => {
    setSearchValue('');
    setSelectedDestination(null);
  };

  const getDriverIcon = (color) => {
    switch (color) {
      case 'red': return require('../../assets/images/busLocations/bus_red.png');
      case 'blue': return require('../../assets/images/busLocations/bus_blue.png');
      case 'green': return require('../../assets/images/busLocations/bus_green.png');
      case 'yellow': return require('../../assets/images/busLocations/bus_yellow.png');
      case 'orange': return require('../../assets/images/busLocations/bus_orange.png');
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : StatusBar.currentHeight || 0}
      style={{ flex: 1 }}
      >
    <SafeAreaView style={styles.container}>
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
        showsUserLocation
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
            >
            <Image
              source={require('../../assets/images/busStop_bus.png')}
              style={{ width: 25, height: 25 }}
              resizeMode="contain"
            />
          </Marker>
        ))}

        {/* Highlight selected destination */}
        {selectedDestination && (
          <Marker
            key="selected-destination"
            coordinate={{ 
              latitude: selectedDestination.latitude, 
              longitude: selectedDestination.longitude 
            }}
            title={selectedDestination.name}
            description="Selected Destination"
          >
            <Image
              source={require('../../assets/images/selectedBus_stop.png')}
              style={{ width: 25, height: 25 }}
              resizeMode="contain"
          />
          </Marker>
        )}

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
                    style={{ width: 40, height: 40 }}
                    resizeMode="contain"
                  />
                </View>
              </Marker>
            ))}
        </MapView>

        <Modalize
          ref={sheetRef}
          alwaysOpen={100}
          snapPoint={150}
          modalHeight={250}
          handleStyle={styles.handleIndicator}
          keyboardAvoidingBehavior="padding" // <-- Helps modal adjust when keyboard shows
          keyboardAvoidingOffset={Platform.OS === 'ios' ? 60 : 20} // <-- Small offset
          avoidKeyboardLikeIOS={true} // <-- Keeps consistent behavior
          adjustToContentHeight={false}
          disableScrollIfPossible={true}
          openAnimationConfig={{
            timing: { duration: 350 },
          }}
        >

          <View style={[styles.sheetContent, { paddingBottom: insets.bottom || 20 }]}>
            <Text style={styles.header}>Where do you want to go?</Text>
          
          {/* Search Input Container */}
          <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter bus stop name..."
                value={searchValue}
                onChangeText={setSearchValue}
                onFocus={() => {
                sheetRef.current?.open('top');
              }}
              />
            
            {/* Search and Clear Buttons */}
            {searchValue.length > 0 && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.clearButton} 
                  onPress={clearSearch}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.searchButton} 
                  onPress={handleSearch}
                >
                  <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

            {/* Show filtered results */}
            {searchValue.length > 0 && (
              <ScrollView 
                style={styles.resultsScroll}
                keyboardShouldPersistTaps="handled"
              >
                {filteredBusStops.length > 0 ? (
                  filteredBusStops.map((stop) => (
                    <TouchableOpacity 
                      key={stop.name} 
                    style={[
                      styles.resultItem,
                      selectedDestination?.name === stop.name && styles.selectedResultItem
                    ]}
                    onPress={() => handleBusStopTap(stop)}
                    >
                    <Text style={[
                      styles.resultText,
                      selectedDestination?.name === stop.name && styles.selectedResultText
                    ]}>
                      {stop.name}
                    </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noResults}>No stops found</Text>
                )}
              </ScrollView>
            )}

          <Text style={styles.header}>🚘 Trip Info</Text>
          {selectedDriver ? (
            <>
              <Text style={styles.driverInfo}>Driver: {selectedDriver.name}</Text>
              <Text style={styles.driverInfo}>Route: {selectedDriver.route}</Text>
              <Text style={styles.driverInfo}>Status: {selectedDriver.status || 'Unavailable'}</Text>
            </>
          ) : (
            <>
            <Text style={styles.placeholderText}>Tap a driver to view details</Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, alignContent: 'center'}}>
              <View style={{alignItems: 'center'}}>
                <Text style={{fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginBottom: 5}}>Bus Stop</Text>
                <Image
                source={require('../../assets/images/busStop_bus.png')}
                style={{ width: 25, height: 25 }}
                resizeMode="contain"
              />
              </View>
              <View style={{alignItems: 'center'}}>
                <Text style={{fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginBottom: 5}}>Selected Bus Stop</Text>
                <Image
                source={require('../../assets/images/selectedBus_stop.png')}
                style={{ width: 25, height: 25 }}
                resizeMode="contain"
              />
              </View>
              <View style={{alignItems: 'center'}}>
                <Text style={{fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginBottom: 5}}>Bus Driver</Text>
                <Image
                  source={require('../../assets/images/bus_black.png')}
                  style={{ width: 25, height: 25 }}
                  resizeMode="contain"
              />
              </View>
              
            </View>
            
            </>
            
          )}
          
          {selectedDestination && (
            <Text style={styles.destinationInfo}>
              📍 Destination: {selectedDestination.name}
            </Text>
          )}
        </View>
      </Modalize>
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  menuBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 3,
    zIndex: 9999,
  },
  title: {
    fontSize: 18,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  sheetContent: { 
    padding: 20, 
    backgroundColor: '#f5f5f5',
  },
  resultsScroll: {
    maxHeight: 200, // Limit the height of results
    marginBottom: 20,
  },
  resultItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  resultText: {
    fontSize: 16,
  },
  noResults: {
    fontStyle: 'italic',
    color: '#666',
    paddingVertical: 10,
  },
  noSelection: {
    fontStyle: 'italic',
    color: '#666',
  },
  handleIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 8,
  },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsContainer: {
    maxHeight: 200,
    marginBottom: 20,
  },
  resultItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 2,
  },
  selectedResultItem: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
  },
  selectedResultText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  noResultsText: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  driverInfo: {
    fontSize: 16,
    marginVertical: 4,
  },
  placeholderText: {
    fontStyle: 'italic',
    color: '#666',
  },
  destinationInfo: {
    fontSize: 16,
    marginTop: 10,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default CarTrackingMapScreen;