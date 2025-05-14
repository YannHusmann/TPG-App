import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Image, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_BASE_URL_WITHOUT_API } from '../config';
import { SafeAreaView } from 'react-native-safe-area-context';

const EditProfilePage = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [originalAvatar, setOriginalAvatar] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        Alert.alert('Erreur', 'Impossible de charger vos informations.');
        navigation.goBack();
        return;
      }

      const data = await res.json();
      setName(data.use_username);
      setEmail(data.use_email);
      setOriginalName(data.use_username);
      setOriginalEmail(data.use_email);
      setOriginalAvatar(data.use_avatar);
    };

    const requestPermission = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Autorisez l’accès aux images dans les réglages.');
      }
    };

    requestPermission();
    fetchUser();
  }, []);

  const pickImage = async () => {
    console.log('pickImage appelée');

    try {
      const { granted } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission refusée', 'L’accès à vos photos est requis.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      console.log('Résultat image picker:', result);

      if (!result.canceled && result.assets?.length > 0) {
        setAvatar(result.assets[0]);
      }
    } catch (error) {
      console.log('Erreur image picker:', error);
      Alert.alert('Erreur', 'Impossible d’ouvrir la galerie.');
    }
  };

  const resetFields = () => {
    setName(originalName);
    setEmail(originalEmail);
    setPassword('');
    setAvatar(null);
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      const formData = new FormData();
      formData.append('use_username', name);
      formData.append('use_email', email);
      if (password) {
        formData.append('use_password', password);
      }
      if (avatar) {
        formData.append('use_avatar', {
          uri: avatar.uri,
          name: avatar.uri.split('/').pop(),
          type: 'image/jpeg',
        });
      }
      formData.append('_method', 'PUT');

      const response = await fetch(`${API_BASE_URL}/user/update`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Succès', 'Profil mis à jour avec succès.');
        navigation.goBack();
      } else {
        console.log('Erreur back:', data);
        Alert.alert('Erreur', data.message || 'Erreur inconnue');
      }
    } catch (e) {
      console.log('Erreur frontend:', e);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l’enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Modifier mon profil</Text>

        <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
          <Image
            source={
              avatar
                ? { uri: avatar.uri }
                : originalAvatar
                  ? { uri: `${API_BASE_URL_WITHOUT_API}${originalAvatar}` }
                  : require('../assets/images/default-avatar.png')
            }
            style={styles.avatar}
          />
          <Text style={styles.changePhotoText}>Changer la photo</Text>
        </TouchableOpacity>

        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nom" />
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Nouveau mot de passe" secureTextEntry />

        <TouchableOpacity style={styles.button} onPress={handleUpdateProfile} disabled={saving}>
          {saving ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sauvegarder</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={resetFields}>
          <Text style={styles.cancelText}>Annuler les modifications</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#fd5312', marginBottom: 20, },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 10, borderColor: '#ccc' },
  button: { backgroundColor: '#fd5312', paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cancelButton: { marginTop: 10, paddingVertical: 10, alignItems: 'center' },
  cancelText: { color: '#888', fontSize: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 10 },
  changePhotoText: { textAlign: 'center', color: '#fd5312', marginBottom: 20 },
  backButton: { marginBottom: 10 },
  backText: { color: '#fd5312', fontSize: 16, fontWeight: '600' },
});

export default EditProfilePage;
