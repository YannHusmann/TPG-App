import React, { useState, useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomePage from '../screens/HomePage';
import ProfilePage from '../screens/ProfilePage';

const Tab = createBottomTabNavigator();

const TabButton = ({ onPress, iconName, isFocused }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

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

const TabNavigator = () => {
  const [user, setUser] = useState(null);

  return (
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
      <Tab.Screen name="Profile">{() => <ProfilePage user={user} />}</Tab.Screen>
    </Tab.Navigator>
  );
};

export default TabNavigator;
