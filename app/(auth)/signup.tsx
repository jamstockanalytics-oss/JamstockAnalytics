import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button, Divider } from "react-native-paper";
import { Link } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { SimpleLogo } from "../../components/SimpleLogo";

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { signUp, signInWithGoogle, loading } = useAuth();

  const onSignup = async () => {
    try {
      setError(null);
      setMessage(null);
      await signUp(email, password);
      setMessage("Check your email to confirm your account.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const onGoogleSignup = async () => {
    try {
      setError(null);
      setMessage(null);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <SimpleLogo size="large" showText={true} />
      <Text variant="headlineMedium" style={styles.title}>Sign Up</Text>
      
      <TextInput 
        mode="outlined" 
        label="Full Name" 
        value={fullName} 
        onChangeText={setFullName}
        style={styles.input}
      />
      
      <TextInput 
        mode="outlined" 
        label="Email" 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none" 
        keyboardType="email-address"
        style={styles.input}
      />
      
      <TextInput 
        mode="outlined" 
        label="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry
        style={styles.input}
      />
      
      {error ? (
        <Text variant="labelSmall" style={styles.errorText}>
          {error}
        </Text>
      ) : null}
      
      {message ? (
        <Text variant="labelSmall" style={styles.successText}>
          {message}
        </Text>
      ) : null}
      
      <Button 
        mode="contained" 
        onPress={onSignup} 
        loading={loading} 
        disabled={loading}
        style={styles.button}
      >
        Create Account
      </Button>

      <View style={styles.dividerContainer}>
        <Divider style={styles.divider} />
        <Text variant="bodySmall" style={styles.dividerText}>OR</Text>
        <Divider style={styles.divider} />
      </View>

      <Button 
        mode="outlined" 
        onPress={onGoogleSignup} 
        loading={loading} 
        disabled={loading}
        style={styles.googleButton}
        icon="google"
      >
        Continue with Google
      </Button>
      
      <Link href="/(auth)/login" asChild>
        <Button style={styles.linkButton}>
          Already have an account? Log In
        </Button>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
    marginTop: 16,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
  googleButton: {
    marginTop: 8,
    borderColor: "#4285f4",
  },
  linkButton: {
    marginTop: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
  successText: {
    color: "green",
    textAlign: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#666",
  },
});


