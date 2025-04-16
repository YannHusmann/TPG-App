import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfilePage = ({ user, navigation }) => {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token'); // ou le nom de ta clé token
      navigation.replace('LoginPage'); // replace pour ne pas revenir à la page profil si on clique retour
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon Profil</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Nom :</Text>
        <Text style={styles.info}>{user?.use_username || 'Non renseigné'}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Email :</Text>
        <Text style={styles.info}>{user?.use_email || 'Non renseigné'}</Text>
      </View>

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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  infoContainer: { width: '100%', marginBottom: 15, padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  label: { fontWeight: 'bold', fontSize: 16, color: '#444' },
  info: { fontSize: 16, color: '#222' },
  editButton: { marginTop: 20, padding: 10, backgroundColor: '#fd5312', borderRadius: 10 },
  editButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logoutButton: { marginTop: 10, padding: 10, backgroundColor: '#aaa', borderRadius: 10 },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ProfilePage;
