import { View } from "react-native";
import { Text } from "react-native-paper";

export function PriorityIndicator({ score }: { score: number | null | undefined }) {
  const normalized = typeof score === "number" ? Math.max(0, Math.min(10, score)) : 0;
  const color = normalized >= 7 ? "#D32F2F" : normalized >= 4 ? "#F9A825" : "#388E3C";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={{ width: 10, height: 10, backgroundColor: color, borderRadius: 5 }} />
      <Text variant="labelSmall">Priority {normalized.toFixed(1)}</Text>
    </View>
  );
}


