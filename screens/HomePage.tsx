import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ActivityIndicator, Alert, TouchableOpacity, FlatList,
  StyleSheet, Image, TextInput, Pressable
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { API_BASE_URL } from '../config';

const busStopIcon = require('../assets/bus-stop.png'); // ✅ require direct

const HomePage = ({ navigation, setUser }) => {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [location, setLocation] = useState(null);
  const [allStops, setAllStops] = useState([]);
  const [nearbyStops, setNearbyStops] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [mapZoom, setMapZoom] = useState({
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const mapRef = useRef(null);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) {
        Alert.alert('Erreur', 'Utilisateur non authentifié.');
        navigation.replace('LoginPage');
        return;
      }
      setToken(storedToken);
    };
    loadToken();
  }, []);

  useEffect(() => {
    const fetchUserAndLocation = async () => {
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          Alert.alert('Erreur', 'Impossible de récupérer les données utilisateur.');
          navigation.replace('LoginPage');
          return;
        }

        const userData = await response.json();
        setUser(userData);

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission refusée', "L'accès à la localisation est nécessaire.");
          return;
        }

        const locationData = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(locationData.coords);
        setLoading(false);
      } catch (error) {
        console.error('Erreur fetchUserAndLocation:', error);
        Alert.alert('Erreur', 'Impossible de charger les informations.');
        navigation.replace('LoginPage');
      }
    };

    fetchUserAndLocation();
  }, [token]);

  useEffect(() => {
    if (token && location) {
      fetchAllStops();
      fetchNearbyStops(location);
    }
  }, [token, location]);

  const fetchAllStops = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stops/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const data = await response.json();
      setAllStops(data.data);
    } catch (error) {
      console.error('Erreur fetchAllStops:', error);
      Alert.alert('Erreur', 'Impossible de récupérer les arrêts.');
    }
  };

  const fetchNearbyStops = async (coords) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stops?lat=${coords.latitude}&lon=${coords.longitude}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const data = await response.json();
      setNearbyStops(data.data);
    } catch (error) {
      console.error('Erreur fetchNearbyStops:', error);
      Alert.alert('Erreur', 'Erreur de connexion ou de réponse du serveur.');
    }
  };

  const filteredStops = allStops.filter(stop =>
    stop.sto_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <Pressable onPress={() => setSearchMode(true)}>
        <TextInput
          style={styles.searchBar}
          placeholder="Rechercher un arrêt..."
          value={searchQuery}
          editable={false}
          pointerEvents="none"
        />
      </Pressable>

      {location && (
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
          >
            {allStops.map((stop) => (
              <Marker
                key={stop.sto_id}
                coordinate={{
                  latitude: parseFloat(stop.sto_latitude),
                  longitude: parseFloat(stop.sto_longitude),
                }}
                title={stop.sto_name}
              >
                <Image source={busStopIcon} style={{ width: 25, height: 25 }} />
              </Marker>
            ))}
          </MapView>
        </View>
      )}

      <FlatList
        data={nearbyStops}
        keyExtractor={(item) => item.sto_id}
        renderItem={({ item }) => (
          <View style={styles.stopItem}>
            <Text style={styles.stopText}>
              {item.sto_name} - {(parseFloat(item.distance) * 1000).toFixed(0)} m
            </Text>
            <TouchableOpacity
              style={styles.reportButton}
              onPress={() => Alert.alert('Signalement', `Signalement pour ${item.sto_name}`)}
            >
              <Text style={styles.reportButtonText}>Signaler un dégât</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fd5312', padding: 15, alignItems: 'center' },
  headerText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  mapContainer: { height: 300 },
  map: { flex: 1, width: '100%' },
  searchBar: {
    margin: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    fontSize: 16
  },
  stopItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  stopText: { fontSize: 16, flex: 1 },
  reportButton: {
    marginLeft: 10,
    backgroundColor: '#fd5312',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  reportButtonText: { color: '#fff', fontSize: 14 }
});

export default HomePage;
