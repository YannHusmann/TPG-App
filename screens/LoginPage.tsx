import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginPage = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    console.log('Tentative de connexion avec :', email, password);

    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez entrer votre email et votre mot de passe.');
      return;
    }

    setLoading(true);

    try {
      console.log('Envoi de la requête à /api/login...');
      const response = await fetch('http://192.168.56.1:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          use_email: email,
          use_password: password
        }),
      });

      console.log('Réponse reçue, statut HTTP:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('Réponse JSON:', JSON.stringify(data, null, 2));
      } catch (error) {
        console.error('Erreur JSON:', error);
        data = { message: 'Réponse non valide du serveur.' };
      }

      if (response.ok) {
        console.log('Connexion réussie, token reçu:', data.token);

        await AsyncStorage.setItem('token', data.token);
        console.log("Token stocké avec succès !");

        Alert.alert('Bienvenue', `Connexion réussie, ${email} !`);

        console.log('Tentative de redirection vers HomePage...');
        navigation.replace('TabNavigator');
      } else {
        console.log('Erreur de connexion:', data.message);
        Alert.alert('Erreur', data.message || 'Email ou mot de passe incorrect.');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      Alert.alert('Erreur', 'Impossible de se connecter. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#fd5312', '#ff7b4d']} style={styles.container}>
      <View style={styles.logoContainer}>
        <Ionicons name="location-outline" size={50} color="white" />
        <Text style={styles.logoText}>TPG Signal</Text>
      </View>

      <View style={styles.box}>
        <Text style={styles.title}>Bienvenue</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#777" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#777" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            secureTextEntry
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Se connecter</Text>}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logoText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  box: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fd5312', marginBottom: 10 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    width: '100%',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    height: 50,
  },
  icon: { marginRight: 10, color: '#777' },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingLeft: 10,
    borderWidth: 0,
    outlineStyle: 'none',
  },
  button: { backgroundColor: '#fd5312', paddingVertical: 12, width: '100%', alignItems: 'center', borderRadius: 10, elevation: 3 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default LoginPage;
