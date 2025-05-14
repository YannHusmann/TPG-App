import React, { useState, useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Animated, TouchableOpacity } from 'react-native';

// Import des écrans
import HomePage from '../screens/HomePage';
import ProfilePage from '../screens/ProfilePage';
import EditProfilePage from '../screens/EditProfilePage';
import LoginPage from '../screens/LoginPage';
import RegisterPage from '../screens/RegisterPage';
import ForgotPasswordPage from '../screens/ForgotPasswordPage';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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

const MainTabs = ({ user, setUser }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: { height: 70 },
      tabBarButton: (props) => (
        <TabButton
          {...props}
          iconName={route.name === 'Home' ? 'home' : 'person'}
          isFocused={props.accessibilityState?.selected ?? false}
        />
      ),
    })}
  >
    <Tab.Screen name="Home">
      {({ navigation }) => (
        <HomePage navigation={navigation} user={user} setUser={setUser} />
      )}
    </Tab.Screen>
    <Tab.Screen name="Profile">
      {({ navigation }) => (
        <ProfilePage navigation={navigation} user={user} />
      )}
    </Tab.Screen>
  </Tab.Navigator>
);

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

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="MainTabs">
            {() => <MainTabs user={user} setUser={setUser} />}
          </Stack.Screen>
          <Stack.Screen name="EditProfile">
            {({ navigation }) => <EditProfilePage user={user} navigation={navigation} />}
          </Stack.Screen>
        </>
      ) : (
        <>
          <Stack.Screen name="LoginPage" component={LoginPage} />
          <Stack.Screen name="RegisterPage" component={RegisterPage} />
          <Stack.Screen name="ForgotPasswordPage" component={ForgotPasswordPage} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
