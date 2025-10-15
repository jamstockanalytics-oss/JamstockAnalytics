import { Stack, Slot } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { AppTheme } from "../constants/Theme";

function RootNav() {
  const { loading, session, isGuest } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <Stack>
      {(session || isGuest) ? (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
      <Stack.Screen name="+not-found" options={{ title: "Not Found" }} />
      <Stack.Screen name="article/[id]" options={{ title: "Article" }} />
      <Stack.Screen name="analysis-session/[id]" options={{ title: "Analysis Session" }} />
      <Stack.Screen name="analysis-session/complete" options={{ title: "Session Complete" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={AppTheme}>
        <AuthProvider>
          <RootNav />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}


