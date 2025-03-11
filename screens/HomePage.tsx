import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomePage = ({ navigation, setUser, user }) => {
  const [loading, setLoading] = useState(true);

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
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data);
      } else {
        Alert.alert('Erreur', data.message || 'Impossible de récupérer les données.');
        navigation.replace('LoginPage');
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger les informations.');
      navigation.replace('LoginPage');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('LoginPage');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fd5312" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Bienvenue, {user?.use_username} !</Text>
      <Text>Email : {user?.use_email}</Text>
      <TouchableOpacity style={{ backgroundColor: '#fd5312', padding: 10, borderRadius: 10, marginTop: 20 }} onPress={handleLogout}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomePage;
