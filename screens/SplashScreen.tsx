import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { checkTokenValid } from '../services/api';

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await checkTokenValid();
      if (isValid) {
        navigation.replace('TabNavigator');
      } else {
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
