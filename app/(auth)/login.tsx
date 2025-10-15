import { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated } from "react-native";
import { Text, TextInput, Button, Divider, Checkbox, ActivityIndicator } from "react-native-paper";
import { Link } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { SimpleLogo } from "../../components/SimpleLogo";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signInWithGoogle, loading } = useAuth();
  
  // Animation refs
  const buttonScale = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const spinnerOpacity = useRef(new Animated.Value(0)).current;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Real-time validation functions
  const validateEmailRealTime = (email: string) => {
    if (!email.trim()) {
      setEmailError("");
      return true;
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePasswordRealTime = (password: string) => {
    if (!password.trim()) {
      setPasswordError("");
      return true;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError("");
    setPasswordError("");

    // Validate email
    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    return isValid;
  };

  // Animation functions
  const showLoadingState = () => {
    setIsSubmitting(true);
    Animated.parallel([
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(spinnerOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideLoadingState = () => {
    setIsSubmitting(false);
    Animated.parallel([
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(spinnerOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onLogin = async () => {
    if (!validateForm()) return;

    try {
      animateButtonPress();
      showLoadingState();
      setIsLoading(true);
      
      await signIn(email, password);
      
      // Success - could add success animation here
    } catch (err: any) {
      hideLoadingState();
      Alert.alert("Login Failed", err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
      hideLoadingState();
    }
  };

  const onGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      Alert.alert("Google Login Failed", err.message || "An error occurred during Google login");
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "Password reset functionality will be implemented soon. Please contact support for assistance.",
      [{ text: "OK" }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.loginCard}>
        {/* Header Section */}
        <View style={styles.loginHeader}>
          <SimpleLogo size="large" showText={true} />
          <Text variant="headlineMedium" style={styles.welcomeTitle}>Welcome Back</Text>
          <Text variant="bodyMedium" style={styles.welcomeSubtitle}>Please sign in to your account</Text>
        </View>

        {/* Login Form */}
        <View style={styles.loginForm}>
          <View style={styles.formGroup}>
            <Text variant="labelLarge" style={styles.label}>Email Address</Text>
            <TextInput 
              mode="outlined" 
              value={email} 
              onChangeText={(text) => {
                setEmail(text);
                validateEmailRealTime(text);
              }}
              placeholder="Enter your email"
              autoCapitalize="none" 
              keyboardType="email-address"
              style={styles.input}
              error={!!emailError}
            />
            {emailError ? (
              <Text variant="labelSmall" style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          <View style={styles.formGroup}>
            <Text variant="labelLarge" style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput 
                mode="outlined" 
                value={password} 
                onChangeText={(text) => {
                  setPassword(text);
                  validatePasswordRealTime(text);
                }}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                style={[styles.input, styles.passwordInput]}
                error={!!passwordError}
              />
              <TouchableOpacity 
                style={styles.togglePassword}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.toggleIcon}>{showPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text variant="labelSmall" style={styles.errorText}>{passwordError}</Text>
            ) : null}
          </View>

          <View style={styles.formOptions}>
            <View style={styles.rememberMeContainer}>
              <Checkbox
                status={rememberMe ? "checked" : "unchecked"}
                onPress={() => setRememberMe(!rememberMe)}
              />
              <Text variant="bodyMedium" style={styles.rememberMeText}>Remember me</Text>
            </View>
            <TouchableOpacity onPress={onForgotPassword}>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Button 
              mode="contained" 
              onPress={onLogin} 
              disabled={isLoading || loading || isSubmitting}
              style={styles.loginButton}
              contentStyle={styles.loginButtonContent}
            >
              <Animated.View style={{ opacity: buttonOpacity }}>
                <Text style={styles.buttonText}>Sign In</Text>
              </Animated.View>
              <Animated.View style={[styles.spinnerContainer, { opacity: spinnerOpacity }]}>
                <ActivityIndicator size="small" color="#fff" />
              </Animated.View>
            </Button>
          </Animated.View>
        </View>

        {/* Social Login Options */}
        <View style={styles.socialLogin}>
          <View style={styles.dividerContainer}>
            <Divider style={styles.divider} />
            <Text variant="bodySmall" style={styles.dividerText}>Or continue with</Text>
            <Divider style={styles.divider} />
          </View>
          
          <View style={styles.socialButtons}>
            <Button 
              mode="outlined" 
              onPress={onGoogleLogin} 
              loading={isLoading || loading}
              disabled={isLoading || loading}
              style={styles.socialButton}
              icon="google"
            >
              Google
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => Alert.alert("GitHub Login", "GitHub authentication will be available soon")}
              style={styles.socialButton}
              icon="github"
            >
              GitHub
            </Button>
          </View>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupLink}>
          <Text variant="bodyMedium" style={styles.signupText}>
            Don't have an account? <Link href="/(auth)/signup" asChild><Text style={styles.signupLinkText}>Sign up</Text></Link>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#667eea", // Gradient background start color
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    minHeight: "100%",
  },
  loginCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.1,
    shadowRadius: 35,
    elevation: 8,
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  loginHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  welcomeTitle: {
    textAlign: "center",
    marginTop: 15,
    marginBottom: 8,
    fontWeight: "600",
    color: "#333333",
    fontSize: 24,
  },
  welcomeSubtitle: {
    textAlign: "center",
    color: "#666666",
    marginBottom: 8,
    fontSize: 14,
  },
  loginForm: {
    marginBottom: 25,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 6,
    fontWeight: "500",
    color: "#333333",
    fontSize: 14,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#e1e5e9",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 50,
  },
  togglePassword: {
    position: "absolute",
    right: 12,
    top: 12,
    padding: 4,
    zIndex: 1,
  },
  toggleIcon: {
    fontSize: 16,
  },
  formOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    fontSize: 14,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rememberMeText: {
    color: "#333333",
    fontSize: 14,
  },
  forgotPassword: {
    color: "#667eea",
    fontWeight: "500",
    textDecorationLine: "underline",
    fontSize: 14,
  },
  loginButton: {
    borderRadius: 8,
    paddingVertical: 14,
    backgroundColor: "#667eea", // Gradient start color
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 4,
  },
  loginButtonContent: {
    paddingVertical: 0,
  },
  errorText: {
    color: "#e74c3c",
    marginTop: 4,
    fontSize: 12,
  },
  socialLogin: {
    marginBottom: 20,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    position: "relative",
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e1e5e9",
  },
  dividerText: {
    marginHorizontal: 15,
    color: "#666666",
    fontSize: 14,
    backgroundColor: "#ffffff",
    paddingHorizontal: 15,
  },
  socialButtons: {
    flexDirection: "row",
    gap: 12,
  },
  socialButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e1e5e9",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  signupLink: {
    alignItems: "center",
    marginTop: 20,
  },
  signupText: {
    color: "#666666",
    fontSize: 14,
  },
  signupLinkText: {
    color: "#667eea",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  spinnerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});


