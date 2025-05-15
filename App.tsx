import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SplashScreen from './screens/SplashScreen';
import LoginPage from './screens/LoginPage';
import RegisterPage from './screens/RegisterPage';
import TabNavigator from './navigation/TabNavigator';
import ForgotPasswordPage from './screens/ForgotPasswordPage';
import ReportPage from './screens/ReportPage';
import ReportsListPage from './screens/ReportsListPage';
import ReportEditPage from './screens/ReportEditPage';

enableScreens();
const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="LoginPage" component={LoginPage} />
          <Stack.Screen name="RegisterPage" component={RegisterPage} />
          <Stack.Screen name="TabNavigator" component={TabNavigator} />
          <Stack.Screen name="ForgotPasswordPage" component={ForgotPasswordPage} />
          <Stack.Screen name="ReportPage" component={ReportPage} />
            <Stack.Screen name="ReportsListPage" component={ReportsListPage} />
            <Stack.Screen name="ReportEditPage" component={ReportEditPage} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
