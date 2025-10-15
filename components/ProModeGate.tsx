import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, Surface } from 'react-native-paper';
import { Link } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

interface ProModeGateProps {
  feature: string;
  children: React.ReactNode;
}

export function ProModeGate({ feature, children }: ProModeGateProps) {
  const { session, isGuest } = useAuth();
  const isAuthenticated = session && !isGuest;

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.gateCard} elevation={4}>
        <View style={styles.iconContainer}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
        
        <Text variant="headlineSmall" style={styles.title}>
          Pro Feature
        </Text>
        
        <Text variant="bodyMedium" style={styles.description}>
          {feature} is available for registered users only.
        </Text>
        
        <Text variant="bodySmall" style={styles.benefits}>
          Unlock AI-powered analysis, personalized insights, and advanced research tools.
        </Text>
        
        <View style={styles.buttonContainer}>
          <Link href="/(auth)/signup" asChild>
            <Button 
              mode="contained" 
              style={styles.signupButton}
              icon="account-plus"
            >
              Sign Up for Pro
            </Button>
          </Link>
          
          <Link href="/(auth)/login" asChild>
            <Button 
              mode="outlined" 
              style={styles.loginButton}
              icon="login"
            >
              Log In
            </Button>
          </Link>
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  gateCard: {
    width: '100%',
    maxWidth: 400,
    padding: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  lockIcon: {
    fontSize: 48,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    color: '#333333',
    fontWeight: '600',
  },
  description: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666666',
    lineHeight: 22,
  },
  benefits: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#888888',
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  signupButton: {
    borderRadius: 8,
    backgroundColor: '#667eea',
  },
  loginButton: {
    borderRadius: 8,
    borderColor: '#667eea',
  },
});
