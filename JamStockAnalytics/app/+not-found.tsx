import { View } from "react-native";
import { Text, Button } from "react-native-paper";
import { Link } from "expo-router";

export default function NotFound() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text variant="headlineMedium">This screen doesn't exist.</Text>
      <Link href="/" asChild>
        <Button mode="contained">Go to home screen</Button>
      </Link>
    </View>
  );
}


