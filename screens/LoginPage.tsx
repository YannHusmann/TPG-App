import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../services/api';

const LoginPage = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez entrer votre email et votre mot de passe.');
      return;
    }

    setLoading(true);

    try {
      const data = await login(email, password);

      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
        Alert.alert('Bienvenue', `Connexion réussie, ${email}`);
        navigation.replace('TabNavigator');
      } else {
        Alert.alert('Erreur', data.message || 'Email ou mot de passe incorrect.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de se connecter au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#777" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              secureTextEntry={!showPassword}
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#777"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordPage')}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('RegisterPage')}>
            <Text style={styles.registerText}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logoText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  box: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center'
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
    justifyContent: 'space-between'
  },
  icon: { marginRight: 10, color: '#777' },
  input: { flex: 1, fontSize: 16, color: '#333' },
  forgotPasswordText: {
    alignSelf: 'flex-end',
    color: '#fd5312',
    marginBottom: 10,
    fontSize: 14
  },
  button: {
    backgroundColor: '#fd5312',
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    borderRadius: 10
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  registerText: { marginTop: 10, color: '#fd5312', fontSize: 16 }
});

export default LoginPage;
