import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingPage from './LandingPage'; // sesuaikan path file Anda
import LoginScreen from './LoginScreen'; // sesuaikan path file Anda

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LandingPage"
        screenOptions={{
          headerShown: false // hide header di semua screen
        }}
      >
        <Stack.Screen 
          name="LandingPage" 
          component={LandingPage}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}