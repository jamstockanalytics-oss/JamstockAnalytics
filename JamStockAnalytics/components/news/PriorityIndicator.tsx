import { View } from "react-native";
import { Text } from "react-native-paper";

export function PriorityIndicator({ score, priority }: { score?: number | null | undefined; priority?: number | null | undefined }) {
  const value = score ?? priority;
  const normalized = typeof value === "number" ? Math.max(0, Math.min(10, value)) : 0;
  const color = normalized >= 7 ? "#D32F2F" : normalized >= 4 ? "#F9A825" : "#388E3C";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={{ width: 10, height: 10, backgroundColor: color, borderRadius: 5 }} />
      <Text variant="labelSmall">Priority {normalized.toFixed(1)}</Text>
    </View>
  );
}


