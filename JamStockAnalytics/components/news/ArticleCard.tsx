import { Card, Text } from "react-native-paper";
import { PriorityIndicator } from "./PriorityIndicator";

type Props = {
  headline: string;
  source: string;
  date: string;
  summary?: string | null;
  priority?: number | null;
  tickers?: string[] | null;
  onPress?: () => void;
};

export function ArticleCard({ headline, source, date, summary, priority, tickers, onPress }: Props) {
  return (
    <Card style={{ marginHorizontal: 16, marginBottom: 12 }} onPress={onPress}>
      <Card.Title title={headline} subtitle={`${source} • ${new Date(date).toLocaleString()}`} />
      {(summary || priority !== undefined) ? (
        <Card.Content>
          {summary ? <Text variant="bodyMedium">{summary}</Text> : null}
          <Text variant="labelSmall" style={{ marginTop: 8 }}>
            {tickers?.join(", ") ?? ""}
          </Text>
          <PriorityIndicator score={priority ?? 0} />
        </Card.Content>
      ) : null}
    </Card>
  );
}


