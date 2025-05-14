import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL, API_BASE_URL_WITHOUT_API } from '../config';

const ProfilePage = ({ user, navigation }) => {
  const avatarUri = user?.use_avatar
    ? `${API_BASE_URL_WITHOUT_API}${user.use_avatar}`
    : require('../assets/images/default-avatar.png');

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
      }
      await AsyncStorage.removeItem('token');
      navigation.replace('LoginPage');
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
      Alert.alert('Erreur', 'La déconnexion a échoué.');
    }
  };

  const buttons = [
    {
      label: 'Mes signalements',
      icon: 'list-circle-outline',
      onPress: () => navigation.navigate('ReportsList'),
    },
    {
      label: 'Modifier mon profil',
      icon: 'person-outline',
      onPress: () => navigation.navigate('EditProfile', { user }),
    },
    {
      label: 'Mentions légales',
      icon: 'document-text-outline',
      onPress: () =>
        navigation.navigate('WebViewPage', {
          url: `${API_BASE_URL_WITHOUT_API}/mentions-legales`,
          title: 'Mentions légales',
        }),
    },
    {
      label: 'Protection des données',
      icon: 'shield-checkmark-outline',
      onPress: () =>
        navigation.navigate('WebViewPage', {
          url: `${API_BASE_URL_WITHOUT_API}/protection-donnees`,
          title: 'Protection des données',
        }),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profil</Text>
      </View>

      <View style={styles.avatarContainer}>
        <Image
          source={typeof avatarUri === 'string' ? { uri: avatarUri } : avatarUri}
          style={styles.avatar}
        />
        <Text style={styles.username}>{user?.use_username}</Text>
        <Text style={styles.email}>{user?.use_email}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        {buttons.map((btn, index) => (
          <TouchableOpacity key={index} style={styles.button} onPress={btn.onPress}>
            <Ionicons name={btn.icon} size={22} color="#fd5312" style={styles.icon} />
            <Text style={styles.buttonText}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#888" style={styles.icon} />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#fd5312',
    padding: 15,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  username: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  email: { fontSize: 14, color: '#666' },
  buttonsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  icon: { marginRight: 12 },
  buttonText: { fontSize: 16, color: '#333' },
  logoutButton: {
    marginTop: 'auto',
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#888',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfilePage;
