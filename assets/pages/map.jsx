import React, { useCallback, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Modalize } from 'react-native-modalize';
import { ScrollView } from 'react-native-gesture-handler';


const CarTrackingMapScreen = () => {
  const sheetRef = useRef(null);


  // Map initial region for zooming in on KNUST
  const initialRegion = {
    latitude: 6.6731,
    longitude: -1.5718,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const destination = 'KNUST Campus';
  const eta = '8 mins';

  const handleSheetChange = useCallback(index => {
    console.log('Bottom sheet index:', index);
  }, []);


  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>
          Map and trip info are only available on mobile (iOS/Android). Please use a mobile device or emulator.
        </Text>
      </View>
    );
  }


  // Bus stops
  const busStops = [
    { name: 'Chemistry Bus Stop', coords: { latitude: 6.674460836771705, longitude: -1.5675313362638799 } },
    { name: 'Pharmacy Bus Stop', coords: { latitude: 6.674798061367296, longitude: -1.5664588657975724 } },
    { name: 'Gaza Bus Stop', coords: { latitude: 6.6865229413454275, longitude: -1.5569190206007884 } },
    { name: 'Medical Village Bus Stop', coords: { latitude: 6.680091975715447, longitude: -1.5491368884918577 } },
    { name: 'Commercial Area Bus Stop', coords: { latitude: 6.6827890091797055, longitude: -1.577008216340791 } },
    { name: 'KSB Bus Stop', coords: { latitude: 6.669327266771381, longitude: -1.5671773386029446 } },
    { name: 'Hall 7 A Bus Stop', coords: { latitude: 6.6792880505895855, longitude: -1.572800620593267 } },
    { name: 'Hall 7 B Bus Stop', coords: { latitude: 6.679633325049614, longitude: -1.572970774312712 } },
    { name: 'Prempeh Lib Bus Stop', coords: { latitude: 6.6750018341728, longitude: -1.5723240108641996 } },
    { name: 'Brunei Bus Stop', coords: { latitude: 6.670467948134247, longitude: -1.5741485986620063 } },
    { name: 'Casely Hayford (SRC) Bus Stop', coords: { latitude: 6.6752288540317455, longitude: -1.567886171892303 } },
  ];

  // Polylines for routes
  const phaToMedi = [
    { latitude: 6.674798061367296, longitude: -1.5664588657975724 },
    { latitude: 6.6794898311886355, longitude: -1.565672810858718 },
    { latitude: 6.684910913245838, longitude: -1.5609393856212919 },
    { latitude: 6.6865229413454275, longitude: -1.5569190206007884 },
    { latitude: 6.684905289760743, longitude: -1.5533919504820606 },
    { latitude: 6.682420454521385, longitude: -1.5500889489896 },
    { latitude: 6.680091975715447, longitude: -1.5491368884918577 },
  ];
  const ksbToCommercial = [
    { latitude: 6.669327266771381, longitude: -1.5671773386029446 },
    { latitude: 6.6752288540317455, longitude: -1.567886171892303 },
    { latitude: 6.675139472277061, longitude: -1.5698682358341896 },
    { latitude: 6.677545389134, longitude: -1.5708594475982072 },
    { latitude: 6.6792880505895855, longitude: -1.572800620593267 },
    { latitude: 6.682135956289475, longitude: -1.576494876409622 },
    { latitude: 6.6827890091797055, longitude: -1.577008216340791 },
  ];
  const commercialToKsb = [
    { latitude: 6.6827890091797055, longitude: -1.577008216340791 },
    { latitude: 6.682135956289475, longitude: -1.576494876409622 },
    { latitude: 6.679633325049614, longitude: -1.572970774312712 },
    { latitude: 6.677545389134, longitude: -1.5708594475982072 },
    { latitude: 6.6752288540317455, longitude: -1.567886171892303 },
  ];
  const bruneiToKsb = [
    { latitude: 6.670467948134247, longitude: -1.5741485986620063 },
    { latitude: 6.6750018341728, longitude: -1.5723240108641996 },
    { latitude: 6.675147601630366, longitude: -1.5692894023140846 },
    { latitude: 6.674460836771705, longitude: -1.5675313362638799 },
    { latitude: 6.669327266771381, longitude: -1.5671773386029446 },
  ];
  const ksbToBrunei = [
    { latitude: 6.669327266771381, longitude: -1.5671773386029446 },
    { latitude: 6.6752288540317455, longitude: -1.567886171892303 },
    { latitude: 6.6750018341728, longitude: -1.5723240108641996 },
    { latitude: 6.670467948134247, longitude: -1.5741485986620063 },
  ];

  return (
    <View style={styles.container}>
      {/* Map Section */}
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        minDelta={0.005}
        maxDelta={0.03}
        minZoomLevel={10}
        maxZoomLevel={17}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={false}
        rotateEnabled={false}
        // No region prop, no onRegionChangeComplete for iOS
        provider={PROVIDER_GOOGLE} // Use Google Maps
      >
        {/* Bus Stop Markers */}
        {busStops.map((stop, idx) => (
          <Marker
            key={stop.name}
            coordinate={stop.coords}
            title={stop.name}
            pinColor="#29722F"
          />
        ))}
        {/* Polylines for routes (straight lines) */}
        <Polyline coordinates={phaToMedi} strokeColor="#FF5733" strokeWidth={4} />
        <Polyline coordinates={ksbToCommercial} strokeColor="#29722F" strokeWidth={4} />
        <Polyline coordinates={commercialToKsb} strokeColor="#29722F" strokeWidth={4} />
        <Polyline coordinates={bruneiToKsb} strokeColor="#007AFF" strokeWidth={4} />
        <Polyline coordinates={ksbToBrunei} strokeColor="#007AFF" strokeWidth={4} />
      </MapView>

      {/* Modalize Bottom Sheet Panel */}
      <Modalize
        ref={sheetRef}
        modalHeight={400}
        handleStyle={styles.handleIndicator}
        adjustToContentHeight={false}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.header}>🚘 Trip Info</Text>
          <Text>📍 Destination: {destination}</Text>
          <Text>⏱ ETA: {eta}</Text>
          <Text>📦 Package Type: Documents</Text>
          <Text>🚦 Status: En Route</Text>
          <Text>🛣 Distance: 4.3 km</Text>
        </View>
      </Modalize>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContent: {
    padding: 20,
    backgroundColor: '#f5f5f5', // more visible
    flexGrow: 1,
    elevation: 10,
    zIndex: 10,
  },
  handleIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 8,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  // absoluteSheet: removed for Modalize
});

export default CarTrackingMapScreen;