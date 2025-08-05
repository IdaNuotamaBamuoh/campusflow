import React, { useCallback, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Modalize } from 'react-native-modalize';

const DriverMapScreen = ({ route }) => {
    const sheetRef = useRef(null);
    const mapRef = useRef(null);
    const snapTimeoutRef = useRef(null);
    const modalRef = useRef(null);

  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('Currently Working'); // can be dynamic later

  //////
    const driverName = 'John Doe';
    const isOnDuty = true;

    const openModal = () => {
        modalRef.current?.open();
    };
//////

  const initialRegion = {
    latitude: 6.6731,
    longitude: -1.5718,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };


  const knustBounds = {
    north:  { latitude: 6.6891, longitude: -1.5640 },
    south:  { latitude: 6.6600, longitude: -1.5650 },
    east:   { latitude: 6.6775, longitude: -1.5400 },
    west:   { latitude: 6.6775, longitude: -1.5900 },
    northeast: { latitude: 6.6950, longitude: -1.5400 },
    northwest: { latitude: 6.6895, longitude: -1.5827 },
    southeast: { latitude: 6.6613, longitude: -1.5531 },
    southwest: { latitude: 6.6602, longitude: -1.5843 },

};
  const isInsideKnust= (region) => {
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
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

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
        initialRegion={initialRegion}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation
        // initialRegion={{
        //   latitude: location.latitude,
        //   longitude: location.longitude,
        //   latitudeDelta: 0.01,
        //   longitudeDelta: 0.01,
        // }}
        provider={PROVIDER_GOOGLE}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title={route?.params?.driverName || "Driver"}
          description={status}
        />
      </MapView>

        <Modalize ref={modalRef} adjustToContentHeight>
            <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{driverName}</Text>
            <Text style={{ marginTop: 10, fontSize: 16 }}>
                Status: <Text style={{ color: isOnDuty ? 'green' : 'red' }}>{isOnDuty ? 'On Duty' : 'Off Duty'}</Text>
            </Text>
            </View>
        </Modalize>

        <TouchableOpacity
        onPress={openModal}
        style={{
            backgroundColor: '#29722F',
            padding: 12,
            borderRadius: 10,
            marginTop: 30,
            alignSelf: 'center',
        }}
        >
        <Text style={{ color: 'white', fontSize: 16 }}>Show Driver Info</Text>
        </TouchableOpacity>
    </View>
  );
};

export default DriverMapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
