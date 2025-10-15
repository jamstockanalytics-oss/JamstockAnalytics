import { View, StyleSheet } from "react-native";
import { Text, Button, Divider } from "react-native-paper";
import { Link } from "expo-router";
import { SimpleLogo } from "../../components/SimpleLogo";
import { useAuth } from "../../contexts/AuthContext";

export default function WelcomeScreen() {
  const { continueAsGuest } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <SimpleLogo size="large" showText={true} />
        
        <Text variant="headlineMedium" style={styles.tagline}>
          Master the JSE with AI-Powered Insights
        </Text>
        
        <Text variant="bodyLarge" style={styles.description}>
          Get personalized financial news analysis, AI-powered market insights, 
          and deep research tools for the Jamaica Stock Exchange.
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            style={styles.guestButton}
            contentStyle={styles.buttonContent}
            onPress={continueAsGuest}
            icon="account-outline"
          >
            Continue as Guest
          </Button>
          
          <Text variant="bodySmall" style={styles.guestNote}>
            Access basic features without signing up
          </Text>
          
          <Divider style={styles.divider} />
          
          <Link href="/(auth)/signup" asChild>
            <Button 
              mode="outlined" 
              style={styles.primaryButton}
              contentStyle={styles.buttonContent}
            >
              Sign Up for Pro Features
            </Button>
          </Link>
          
          <Link href="/(auth)/login" asChild>
            <Button 
              mode="text" 
              style={styles.secondaryButton}
              contentStyle={styles.buttonContent}
            >
              Already have an account? Log In
            </Button>
          </Link>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.footerText}>
          Powered by DeepSeek AI • Built for Jamaican Markets
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagline: {
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 16,
    color: '#1976D2',
    fontWeight: '600',
  },
  description: {
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
    color: '#666',
    paddingHorizontal: 16,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  guestButton: {
    borderRadius: 8,
    backgroundColor: '#667eea',
  },
  guestNote: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  primaryButton: {
    borderRadius: 8,
    borderColor: '#667eea',
  },
  secondaryButton: {
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    color: '#999',
  },
});
