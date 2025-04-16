import React, { useState, useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Animated, TouchableOpacity } from 'react-native';

// Import des écrans
import HomePage from '../screens/HomePage';
import ProfilePage from '../screens/ProfilePage';
import EditProfilePage from '../screens/EditProfilePage';
import LoginPage from '../screens/LoginPage';
import RegisterPage from '../screens/RegisterPage';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Animation des icônes d'onglet
const TabButton = ({ onPress, iconName, isFocused }) => {
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1.5 : 1)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: isFocused ? 1.5 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  return (
    <TouchableOpacity onPress={onPress} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons name={iconName} size={24} color={isFocused ? '#fd5312' : '#888'} />
      </Animated.View>
    </TouchableOpacity>
  );
};

// Auth Stack (Login & Register)
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LoginPage" component={LoginPage} />
    <Stack.Screen name="RegisterPage" component={RegisterPage} />
  </Stack.Navigator>
);

// Onglets principaux (Home & Profile)
const MainTabs = ({ user, setUser, navigation }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarShowLabel: false,
      tabBarStyle: { height: 70 },
      tabBarButton: (props) => (
        <TabButton
          {...props}
          iconName={route.name === 'Home' ? 'home' : 'person'}
          isFocused={props.accessibilityState.selected}
        />
      ),
    })}
  >
    <Tab.Screen name="Home">
      {({ navigation }) => <HomePage navigation={navigation} setUser={setUser} user={user} />}
    </Tab.Screen>
    <Tab.Screen name="Profile">
      {({ navigation }) => <ProfilePage navigation={navigation} user={user} />}
    </Tab.Screen>
  </Tab.Navigator>
);

// Stack Principal (MainTabs + EditProfilePage)
const AppNavigator = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return null; // Attendre l'authentification

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="MainTabs">
            {({ navigation }) => <MainTabs user={user} setUser={setUser} navigation={navigation} />}
          </Stack.Screen>
          <Stack.Screen name="EditProfile">
            {({ navigation }) => <EditProfilePage user={user} navigation={navigation} />}
          </Stack.Screen>
        </>
      ) : (
        <Stack.Screen name="AuthStack" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;