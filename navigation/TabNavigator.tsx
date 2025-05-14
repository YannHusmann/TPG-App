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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TABS = [
  { name: 'Home', icon: 'home' },
  { name: 'Profile', icon: 'person' },
];

const TabButton = ({ onPress, iconName, isFocused }) => {
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
      style={styles.tabButton}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.iconWrapper,
          {
            transform: [{ scale }],
            backgroundColor: isFocused ? '#fd5312' : 'transparent',
          },
        ]}
      >
        <Ionicons
          name={iconName}
          size={22}
          color={isFocused ? 'white' : '#888'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const BubbleTabBar = ({ state, descriptors, navigation }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const tabWidth = Dimensions.get('window').width / state.routes.length;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
    }).start();
  }, [state.index]);

  return (
    <View style={styles.tabBarContainer}>
      <Animated.View
        style={[
          styles.bubble,
          {
            transform: [{ translateX }],
            width: tabWidth - 16,
            marginHorizontal: 8,
          },
        ]}
      />
      {state.routes.map((route, index) => {
        const label = TABS[index].icon;
        const isFocused = state.index === index;

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
    height: 56,
    backgroundColor: '#fff',
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -40,
  },
  bubble: {
    position: 'absolute',
    height: 40,
    backgroundColor: '#fd5312',
    borderRadius: 20,
    top: 8,
    left: 0,
    zIndex: -1,
  },
});

export default AppNavigator;
