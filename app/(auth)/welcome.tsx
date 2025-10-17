import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { SimpleLogo } from "../../components/SimpleLogo";

export default function WelcomeScreen() {
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
        
        <Text variant="bodyMedium" style={styles.note}>
          All features are now free to access! Use the navigation tabs below to explore. 
          Sign in through the "Login" tab for personalized experience.
        </Text>
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
    backgroundColor: '#2563eb',
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
    borderColor: '#2563eb',
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
  note: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
    paddingHorizontal: 16,
    fontStyle: 'italic',
  },
});
