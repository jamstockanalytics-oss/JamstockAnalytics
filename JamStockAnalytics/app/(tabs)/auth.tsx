import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, TextInput, Card, Divider } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthTab() {
  const { signIn, signUp, signOut, session, isGuest, continueAsGuest } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isLogin && !fullName) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    continueAsGuest();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // If user is already authenticated, show profile options
  if (session && !isGuest) {
    return (
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              Welcome, {session.user?.user_metadata?.full_name || 'User'}!
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              You're signed in with full access to all features.
            </Text>
            
            <Button 
              mode="outlined" 
              onPress={handleSignOut}
              style={styles.signOutButton}
              icon="logout"
            >
              Sign Out
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          {isLogin ? 'Sign In' : 'Create Account'}
        </Text>
        
        <Text variant="bodyMedium" style={styles.subtitle}>
          {isLogin 
            ? 'Sign in to access all Pro features' 
            : 'Create an account for personalized insights'
          }
        </Text>

        <Card style={styles.authCard}>
          <Card.Content>
            {!isLogin && (
              <TextInput
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
                mode="outlined"
              />
            )}
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              mode="outlined"
            />

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Button
              mode="contained"
              onPress={handleAuth}
              loading={loading}
              disabled={loading}
              style={styles.authButton}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>

            <Button
              mode="text"
              onPress={() => setIsLogin(!isLogin)}
              style={styles.toggleButton}
            >
              {isLogin 
                ? "Don't have an account? Sign Up" 
                : "Already have an account? Sign In"
              }
            </Button>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        <Card style={styles.guestCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.guestTitle}>
              Continue as Guest
            </Text>
            <Text variant="bodyMedium" style={styles.guestDescription}>
              Access basic features without creating an account
            </Text>
            
            <Button
              mode="outlined"
              onPress={handleContinueAsGuest}
              style={styles.guestButton}
              icon="account-outline"
            >
              Continue as Guest
            </Button>
          </Card.Content>
        </Card>

        {isGuest && (
          <Card style={styles.guestStatusCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.guestStatusTitle}>
                You're browsing as a guest
              </Text>
              <Text variant="bodySmall" style={styles.guestStatusDescription}>
                Sign up for full access to AI analysis, personalized insights, and advanced features.
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 16,
  },
  headerTitle: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#333333',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666666',
  },
  card: {
    marginBottom: 16,
  },
  authCard: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  authButton: {
    marginBottom: 16,
  },
  toggleButton: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  guestCard: {
    backgroundColor: '#f8f9fa',
  },
  guestTitle: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#333333',
  },
  guestDescription: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666666',
  },
  guestButton: {
    marginBottom: 8,
  },
  guestStatusCard: {
    backgroundColor: '#e3f2fd',
    marginTop: 16,
  },
  guestStatusTitle: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#1976d2',
  },
  guestStatusDescription: {
    textAlign: 'center',
    color: '#666666',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#333333',
  },
  signOutButton: {
    marginTop: 16,
  },
});
