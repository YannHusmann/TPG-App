import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const ProfilePage = ({ user, navigation }) => {
  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      }

      await AsyncStorage.removeItem('token');
      navigation.replace('LoginPage');
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
      Alert.alert('Erreur', 'La déconnexion a échoué.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Mon Profil</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Nom :</Text>
          <Text style={styles.info}>{user?.use_username || 'Non renseigné'}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Email :</Text>
          <Text style={styles.info}>{user?.use_email || 'Non renseigné'}</Text>
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
          <Text style={styles.actionButtonText}>Voir mes signalements</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile', { user })}
        >
          <Text style={styles.editButtonText}>Modifier mes infos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#fd5312', width: '100%', padding: 15, alignItems: 'center' },
  headerText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  body: { padding: 20, alignItems: 'center' },
  infoContainer: { width: '100%', marginBottom: 15, padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  label: { fontWeight: 'bold', fontSize: 16, color: '#444' },
  info: { fontSize: 16, color: '#222' },
  actionButton: { marginTop: 20, padding: 10, backgroundColor: '#fd5312', borderRadius: 10 },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  editButton: { marginTop: 10, padding: 10, backgroundColor: '#ffa940', borderRadius: 10 },
  editButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logoutButton: { marginTop: 10, padding: 10, backgroundColor: '#aaa', borderRadius: 10 },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ProfilePage;
