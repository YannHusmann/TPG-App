import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Asset } from 'expo-asset';

const busStopIcon = Asset.fromModule(require('../assets/bus-stop.png')).uri;

const HomePage = ({ navigation, setUser, user }) => {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [allStops, setAllStops] = useState([]);
  const [nearbyStops, setNearbyStops] = useState([]);
  const [mapZoom, setMapZoom] = useState({
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const mapRef = useRef(null);

  useEffect(() => {
    fetchUserData();
    getLocation();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erreur', 'Utilisateur non authentifié.');
        navigation.replace('LoginPage');
        return;
      }

      const response = await fetch('http://192.168.56.1:8000/api/me', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        Alert.alert('Erreur', 'Impossible de récupérer les données utilisateur.');
        navigation.replace('LoginPage');
      }
    } catch (error) {
      console.error('Erreur fetchUserData:', error);
      Alert.alert('Erreur', 'Impossible de charger les informations.');
      navigation.replace('LoginPage');
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', "L'accès à la localisation est nécessaire.");
      return;
    }

    const locationData = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setLocation(locationData.coords);
    fetchAllStops();
    fetchNearbyStops(locationData.coords);
  };

  const fetchAllStops = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.56.1:8000/api/stops/all', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      const data = await response.json();
      setAllStops(data.data);
    } catch (error) {
      console.error('Erreur fetchAllStops:', error);
      Alert.alert('Erreur', 'Erreur de connexion au serveur.');
    }
  };

  const fetchNearbyStops = async (coords) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://192.168.56.1:8000/api/stops?lat=${coords.latitude}&lon=${coords.longitude}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      const data = await response.json();
      setNearbyStops(data.data);
    } catch (error) {
      console.error('Erreur fetchNearbyStops:', error);
      Alert.alert('Erreur', 'Erreur de connexion au serveur.');
    }
  };

  const centerMapOnUser = () => {
    if (mapRef.current && location) {
      const zoomed = { latitudeDelta: 0.005, longitudeDelta: 0.005 };
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        ...zoomed,
      }, 1000);
      setMapZoom(zoomed);
    }
  };

  const zoomIn = () => {
    setMapZoom(prev => ({
      latitudeDelta: prev.latitudeDelta / 2,
      longitudeDelta: prev.longitudeDelta / 2,
    }));
  };

  const zoomOut = () => {
    setMapZoom(prev => ({
      latitudeDelta: prev.latitudeDelta * 2,
      longitudeDelta: prev.longitudeDelta * 2,
    }));
  };

  const customMapStyle = [
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', stylers: [{ visibility: 'on' }] },
    { featureType: 'water', stylers: [{ visibility: 'on' }] },
    { featureType: 'landscape', stylers: [{ visibility: 'on' }] },
  ];

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#fd5312" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Accueil</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionText}>Carte de localisation</Text>
      </View>

      {location ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: mapZoom.latitudeDelta,
              longitudeDelta: mapZoom.longitudeDelta,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
            toolbarEnabled={false}
            customMapStyle={customMapStyle}
          >
            {allStops.map((stop) => (
              <Marker
                key={stop.sto_id}
                coordinate={{
                  latitude: parseFloat(stop.sto_latitude),
                  longitude: parseFloat(stop.sto_longitude)
                }}
                title={stop.sto_name}
              >
                <Image source={{ uri: busStopIcon }} style={{ width: 25, height: 25 }} />
              </Marker>
            ))}
          </MapView>

          <TouchableOpacity style={styles.recenterButton} onPress={centerMapOnUser}>
            <Text style={styles.recenterText}>🧭</Text>
          </TouchableOpacity>

          <View style={styles.zoomControls}>
            <TouchableOpacity onPress={zoomIn} style={styles.zoomButton}>
              <Text style={styles.zoomText}>＋</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={zoomOut} style={styles.zoomButton}>
              <Text style={styles.zoomText}>－</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionText}>Arrêts à proximité</Text>
      </View>

      <FlatList
        data={nearbyStops}
        keyExtractor={(item) => item.sto_id}
        renderItem={({ item }) => (
          <View style={styles.stopItem}>
            <Text style={styles.stopText}>
              {item.sto_name} - {(parseFloat(item.distance) * 1000).toFixed(0)} m
            </Text>

          </View>
        )}
        nestedScrollEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fd5312', padding: 15, alignItems: 'center' },
  headerText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  sectionHeader: { backgroundColor: '#fd5312', padding: 10, alignItems: 'center', marginTop: 10 },
  sectionText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  mapContainer: { height: 300 },
  map: { flex: 1, width: '100%' },
  recenterButton: {
    position: 'absolute',
    bottom: 85,
    right: 15,
    backgroundColor: '#fff',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  zoomControls: {
    position: 'absolute',
    bottom: 140,
    right: 15,
    alignItems: 'center',
  },
  zoomButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    elevation: 4,
  },
  zoomText: {
    fontSize: 24,
  },
  loadingText: { textAlign: 'center', marginVertical: 20 },
  stopItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ddd' },
  stopText: { fontSize: 16 },
});

export default HomePage;
