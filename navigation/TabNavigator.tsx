import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import HomePage from '../screens/HomePage';
import ProfilePage from '../screens/ProfilePage';
import EditProfilePage from '../screens/EditProfilePage';
import WebViewPage from '../screens/WebViewPage';
import LoginPage from '../screens/LoginPage';
import RegisterPage from '../screens/RegisterPage';
import ForgotPasswordPage from '../screens/ForgotPasswordPage';
import ReportPage from '../screens/ReportPage';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TABS = [
  { name: 'Home', icon: 'home' },
  { name: 'Report', icon: 'warning' },
  { name: 'Profile', icon: 'person' },
];

const TabButton = ({ onPress, iconName, isFocused, isCenter }) => {
  const scale = useRef(new Animated.Value(isFocused ? 1.2 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isFocused ? 1.2 : 1,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabButton, isCenter && styles.centerButton]}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.iconWrapper,
          isCenter && styles.iconCenterWrapper,
          {
            transform: [{ scale }],
            backgroundColor: isFocused ? '#fd5312' : 'white',
            borderWidth: isCenter ? 2 : 0,
            borderColor: isCenter && isFocused ? '#fd5312' : 'transparent',
          },
        ]}
      >
        <Ionicons
          name={iconName}
          size={isCenter ? 30 : 22}
          color={isFocused ? '#fff' : '#fd5312'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const BubbleTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const label = TABS[index].icon;
        const isFocused = state.index === index;
        const isCenter = route.name === 'Report';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabButton
            key={route.key}
            onPress={onPress}
            iconName={label}
            isFocused={isFocused}
            isCenter={isCenter}
          />
        );
      })}
    </View>
  );
};

const MainTabs = ({ user, setUser }) => (
  <Tab.Navigator
    tabBar={(props) => <BubbleTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Home">
      {({ navigation }) => (
        <HomePage navigation={navigation} user={user} setUser={setUser} />
      )}
    </Tab.Screen>

    <Tab.Screen name="Report" component={ReportPage} />

    <Tab.Screen name="Profile">
      {({ navigation }) => (
        <ProfilePage navigation={navigation} user={user} />
      )}
    </Tab.Screen>
  </Tab.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LoginPage" component={LoginPage} />
    <Stack.Screen name="RegisterPage" component={RegisterPage} />
    <Stack.Screen name="ForgotPasswordPage" component={ForgotPasswordPage} />
  </Stack.Navigator>
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
          <Stack.Screen name="WebViewPage" component={WebViewPage} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    padding: 8,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -40,
  },
  iconCenterWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fd5312', // même couleur que les autres
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  centerButton: {
    top: -12,
    zIndex: 10,
  },
  bubble: {
    display: 'none',
  },
});

export default AppNavigator;
