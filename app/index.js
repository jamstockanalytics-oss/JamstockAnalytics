import { Redirect } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
  const { session, loading } = useAuth();
  
  if (loading) {
    return null; // Will be handled by _layout.tsx
  }
  
  if (session) {
    return <Redirect href="/(tabs)" />;
  }
  
  return <Redirect href="/(auth)/welcome" />;
}
