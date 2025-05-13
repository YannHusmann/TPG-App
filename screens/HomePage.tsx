import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, ActivityIndicator, Alert, TouchableOpacity, FlatList,
  StyleSheet, Image, TextInput, RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { API_BASE_URL } from '../config';
import { Ionicons } from '@expo/vector-icons';

const mapStyle = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit.station', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', stylers: [{ saturation: -100 }, { lightness: 20 }] },
];

const HomePage = ({ navigation, setUser }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState(null);
  const [location, setLocation] = useState(null);
  const [allStops, setAllStops] = useState([]);
  const [nearbyStops, setNearbyStops] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [mapZoom] = useState({ latitudeDelta: 0.015, longitudeDelta: 0.015 });

  const mapRef = useRef(null);

  const recenterMap = async () => {
    if (!location || !mapRef.current) return;
    mapRef.current.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: mapZoom.latitudeDelta,
      longitudeDelta: mapZoom.longitudeDelta,
    });
  };

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

  const fetchAllStops = async () => {
    const response = await fetch(`${API_BASE_URL}/stops/all`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    const data = await response.json();
    setAllStops(data.data);
  };

  const fetchNearbyStops = async (coords) => {
    const response = await fetch(`${API_BASE_URL}/stops?lat=${coords.latitude}&lon=${coords.longitude}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    const data = await response.json();
    setNearbyStops(data.data);
  };

  const handleRefresh = useCallback(async () => {
    if (!location) return;
    setRefreshing(true);
    await fetchNearbyStops(location);
    setRefreshing(false);
  }, [location]);

  useEffect(() => {
    const fetchUserAndLocation = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/me`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        if (!response.ok) throw new Error('Non connecté');
        const userData = await response.json();
        setUser(userData);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission refusée', "L'accès à la localisation est nécessaire.");
          return;
        }
        const locationData = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(locationData.coords);
        setLoading(false);
      } catch (error) {
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

  const filteredStops = allStops.filter(stop =>
    stop.sto_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStopItem = ({ item }) => (
    <View style={styles.stopItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.stopText}>{item.sto_name}</Text>
        {item.distance && (
          <Text style={styles.distanceText}>{(parseFloat(item.distance) * 1000).toFixed(0)} m</Text>
        )}
        <View style={styles.lineContainer}>
          {item.routes?.map(route => (
            <View key={route.rou_id} style={styles.lineBox}>
              <Text style={styles.lineText}>{route.rou_code}</Text>
            </View>
          ))}
        </View>
      </View>
      <TouchableOpacity
        style={styles.reportButton}
        onPress={() => Alert.alert('Signalement', `Signalement pour ${item.sto_name}`)}>
        <Text style={styles.reportButtonText}>Signaler un dégât</Text>
      </TouchableOpacity>
    </View>
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

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={{ marginLeft: 10 }} />
        <TextInput
          style={styles.searchBar}
          placeholder="Rechercher un arrêt..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setSearchMode(true)}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#888" style={{ marginHorizontal: 5 }} />
          </TouchableOpacity>
        )}
        {searchMode && (
          <TouchableOpacity onPress={() => { setSearchMode(false); setSearchQuery(''); }}>
            <Text style={styles.cancelTextRight}>Annuler</Text>
          </TouchableOpacity>
        )}
      </View>

      {searchMode && (
        <View style={styles.overlaySearchBox}>
          <FlatList
            data={filteredStops}
            keyExtractor={(item) => item.sto_id}
            renderItem={renderStopItem}
          />
        </View>
      )}

      {!searchMode && location && (
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
            mapType="standard"
            customMapStyle={mapStyle}
            showsUserLocation
            showsPointsOfInterest={false}
            showsBuildings={false}
            provider={PROVIDER_GOOGLE}
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
                <Image
                  source={require('../assets/images/bus_stop.png')}
                  style={{ width: 30, height: 30, resizeMode: 'contain' }}
                />
              </Marker>
            ))}
          </MapView>
          <TouchableOpacity style={styles.recenterButton} onPress={recenterMap}>
            <Ionicons name="locate" size={24} color="#fd5312" />
          </TouchableOpacity>
        </View>
      )}

      {!searchMode && (
        <>
          <View style={styles.sectionHeaderCentered}>
            <Text style={styles.sectionTitleOrange}>Arrêts à proximité</Text>
            <TouchableOpacity onPress={handleRefresh}>
              <Ionicons name="refresh" size={20} color="#fd5312" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={nearbyStops}
            keyExtractor={(item) => item.sto_id}
            renderItem={renderStopItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
        </>
      )}
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
  recenterButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    elevation: 5
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 5
  },
  searchBar: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingHorizontal: 10
  },
  cancelTextRight: {
    fontSize: 16,
    color: '#fd5312',
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  overlaySearchBox: {
    flex: 1,
    paddingTop: 10
  },
  sectionHeaderCentered: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitleOrange: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fd5312',
    textAlign: 'center',
    flex: 1
  },
  stopItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  stopText: { fontSize: 16, fontWeight: '600' },
  distanceText: { fontSize: 14, color: '#666' },
  lineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4
  },
  lineBox: {
    backgroundColor: '#eee',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginTop: 2
  },
  lineText: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold'
  },
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
