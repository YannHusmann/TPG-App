import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { checkTokenValid } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';


const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    const checkAuth = async () => {
      const timeout = setTimeout(() => {
        console.log('→ Timeout : redirection par sécurité');
        navigation.replace('LoginPage');
      }, 5000);

      try {
        const isValid = await checkTokenValid();
        clearTimeout(timeout);

        if (isValid) {
          console.log('→ Token valide, redirection TabNavigator');
          navigation.replace('TabNavigator');
        } else {
          console.log('→ Token invalide, suppression');
          await AsyncStorage.removeItem('token');
          navigation.replace('LoginPage');
        }
      } catch (e) {
        clearTimeout(timeout);
        console.log('→ Erreur dans checkTokenValid', e);
        navigation.replace('LoginPage');
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#fd5312" />
      <Text style={styles.text}>Chargement...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 10, fontSize: 16, color: '#333' },
});

export default SplashScreen;
