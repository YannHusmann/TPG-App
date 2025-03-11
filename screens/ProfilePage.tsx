import React from 'react';
import { View, Text } from 'react-native';

const ProfilePage = ({ user }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Profil</Text>
    <Text>Nom: {user?.use_username || 'Utilisateur inconnu'}</Text>
    <Text>Email: {user?.use_email || 'Non disponible'}</Text>
  </View>
);

export default ProfilePage;
