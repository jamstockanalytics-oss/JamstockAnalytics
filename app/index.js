import { Redirect } from "expo-router";

export default function Index() {
  // Always redirect to tabs - authentication is handled within the app
  return <Redirect href="/(tabs)" />;
}
