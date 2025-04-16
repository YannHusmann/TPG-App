import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Récupération correcte des paramètres via `route`
const EditProfilePage = ({ route, navigation }) => {
  const user = route?.params?.user || null;  // Vérification pour éviter undefined
  const [name, setName] = useState(user?.use_username || '');
  const [email, setEmail] = useState(user?.use_email || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erreur', 'Utilisateur non authentifié.');
        navigation.replace('LoginPage');
        return;
      }

      const response = await fetch('http://192.168.56.1:8000/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          use_username: name,
          use_email: email,
          use_password: password, // Permet la mise à jour du mot de passe
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Succès', 'Profil mis à jour avec succès.');
        navigation.goBack(); // Retourne au profil après mise à jour
      } else {
        Alert.alert('Erreur', data.message || 'Impossible de mettre à jour le profil.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Un problème est survenu lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier Profil</Text>

      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nom" />
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
      <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Nouveau mot de passe" secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile} disabled={saving}>
        {saving ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sauvegarder</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 10 },
  button: { backgroundColor: '#fd5312', paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default EditProfilePage;
