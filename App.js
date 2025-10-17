import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './contexts/AuthContext';
import { theme } from './constants/Theme';

// Import your main app component
import AppLayout from './app/_layout';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer>
          <AppLayout />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}
