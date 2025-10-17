import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, Divider } from 'react-native-paper';
import { SocialShareButton, QuickShareButtons } from './SocialShareButton';
import { SocialSharingService } from '../../lib/services/social-sharing-service';

interface Article {
  id: string;
  headline: string;
  summary?: string;
  url: string;
  source: string;
  publishedAt: string;
  aiPriorityScore?: number;
  companyTickers?: string[];
}

interface ArticleShareButtonProps {
  article: Article;
  variant?: 'button' | 'card' | 'inline';
  showPreview?: boolean;
  onShare?: (platform: string) => void;
}

export const ArticleShareButton: React.FC<ArticleShareButtonProps> = ({
  article,
  variant = 'button',
  showPreview: _showPreview = false,
  onShare,
}) => {

  const shareableContent = SocialSharingService.createArticleContent(article);

  const handleShare = (platform: string) => {
    if (onShare) {
      onShare(platform);
    }
  };

  const renderButton = () => {
    if (variant === 'card') {
      return (
        <Card style={styles.shareCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Share Article
              </Text>
              <Chip
                mode="outlined"
                compact
                style={styles.priorityChip}
              >
                Priority: {article.aiPriorityScore?.toFixed(1) || 'N/A'}
              </Chip>
            </View>
            
            <Text variant="bodyMedium" style={styles.articleTitle}>
              {article.headline}
            </Text>
            
            {article.summary && (
              <Text variant="bodySmall" style={styles.articleSummary}>
                {article.summary}
              </Text>
            )}
            
            <View style={styles.articleMeta}>
              <Text variant="bodySmall" style={styles.metaText}>
                Source: {article.source}
              </Text>
              <Text variant="bodySmall" style={styles.metaText}>
                {new Date(article.publishedAt).toLocaleDateString()}
              </Text>
            </View>
            
            {article.companyTickers && article.companyTickers.length > 0 && (
              <View style={styles.tickerContainer}>
                <Text variant="bodySmall" style={styles.tickerLabel}>
                  Related Companies:
                </Text>
                <View style={styles.tickerChips}>
                  {article.companyTickers.map((ticker, index) => (
                    <Chip
                      key={index}
                      mode="outlined"
                      compact
                      style={styles.tickerChip}
                    >
                      {ticker}
                    </Chip>
                  ))}
                </View>
              </View>
            )}
            
            <Divider style={styles.divider} />
            
            <View style={styles.shareActions}>
              <QuickShareButtons
                content={shareableContent}
                platforms={['twitter', 'facebook', 'whatsapp', 'linkedin']}
                onShare={handleShare}
              />
            </View>
          </Card.Content>
        </Card>
      );
    }

    if (variant === 'inline') {
      return (
        <View style={styles.inlineContainer}>
          <Text variant="bodySmall" style={styles.inlineLabel}>
            Share this article:
          </Text>
          <QuickShareButtons
            content={shareableContent}
            platforms={['twitter', 'facebook', 'whatsapp']}
            onShare={handleShare}
          />
        </View>
      );
    }

    return (
      <SocialShareButton
        content={shareableContent}
        variant="button"
        size="medium"
        onShare={handleShare}
      />
    );
  };

  return renderButton();
};

export const AIMessageShareButton: React.FC<{
  message: {
    content: string;
    timestamp: string;
    context?: string;
  };
  variant?: 'button' | 'card' | 'inline';
  onShare?: (platform: string) => void;
}> = ({ message, variant = 'button', onShare }) => {
  const shareableContent = SocialSharingService.createAIMessageContent(message);

  const handleShare = (platform: string) => {
    if (onShare) {
      onShare(platform);
    }
  };

  if (variant === 'card') {
    return (
      <Card style={styles.shareCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Share AI Analysis
            </Text>
            <Chip
              mode="outlined"
              compact
              style={styles.aiChip}
            >
              AI Generated
            </Chip>
          </View>
          
          <Text variant="bodyMedium" style={styles.messageContent}>
            {message.content}
          </Text>
          
          {message.context && (
            <Text variant="bodySmall" style={styles.messageContext}>
              Context: {message.context}
            </Text>
          )}
          
          <View style={styles.messageMeta}>
            <Text variant="bodySmall" style={styles.metaText}>
              Generated: {new Date(message.timestamp).toLocaleString()}
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.shareActions}>
            <QuickShareButtons
              content={shareableContent}
              platforms={['twitter', 'facebook', 'whatsapp', 'linkedin']}
              onShare={handleShare}
            />
          </View>
        </Card.Content>
      </Card>
    );
  }

  if (variant === 'inline') {
    return (
      <View style={styles.inlineContainer}>
        <Text variant="bodySmall" style={styles.inlineLabel}>
          Share AI analysis:
        </Text>
        <QuickShareButtons
          content={shareableContent}
          platforms={['twitter', 'facebook', 'whatsapp']}
          onShare={handleShare}
        />
      </View>
    );
  }

  return (
    <SocialShareButton
      content={shareableContent}
      variant="button"
      size="medium"
      onShare={handleShare}
    />
  );
};

export const ChartShareButton: React.FC<{
  chart: {
    title: string;
    description: string;
    data: any;
    design: string;
  };
  variant?: 'button' | 'card' | 'inline';
  onShare?: (platform: string) => void;
}> = ({ chart, variant = 'button', onShare }) => {
  const shareableContent = SocialSharingService.createChartContent(chart);

  const handleShare = (platform: string) => {
    if (onShare) {
      onShare(platform);
    }
  };

  if (variant === 'card') {
    return (
      <Card style={styles.shareCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Share Chart
            </Text>
            <Chip
              mode="outlined"
              compact
              style={styles.chartChip}
            >
              {chart.design} Design
            </Chip>
          </View>
          
          <Text variant="bodyMedium" style={styles.chartTitle}>
            {chart.title}
          </Text>
          
          <Text variant="bodySmall" style={styles.chartDescription}>
            {chart.description}
          </Text>
          
          <View style={styles.chartMeta}>
            <Text variant="bodySmall" style={styles.metaText}>
              Data Points: {chart.data?.labels?.length || 0}
            </Text>
            <Text variant="bodySmall" style={styles.metaText}>
              Design: {chart.design}
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.shareActions}>
            <QuickShareButtons
              content={shareableContent}
              platforms={['twitter', 'facebook', 'whatsapp', 'linkedin']}
              onShare={handleShare}
            />
          </View>
        </Card.Content>
      </Card>
    );
  }

  if (variant === 'inline') {
    return (
      <View style={styles.inlineContainer}>
        <Text variant="bodySmall" style={styles.inlineLabel}>
          Share chart:
        </Text>
        <QuickShareButtons
          content={shareableContent}
          platforms={['twitter', 'facebook', 'whatsapp']}
          onShare={handleShare}
        />
      </View>
    );
  }

  return (
    <SocialShareButton
      content={shareableContent}
      variant="button"
      size="medium"
      onShare={handleShare}
    />
  );
};

const styles = StyleSheet.create({
  shareCard: {
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: '600',
    flex: 1,
  },
  priorityChip: {
    backgroundColor: '#E3F2FD',
  },
  aiChip: {
    backgroundColor: '#F3E5F5',
  },
  chartChip: {
    backgroundColor: '#E8F5E8',
  },
  articleTitle: {
    fontWeight: '500',
    marginBottom: 8,
  },
  articleSummary: {
    color: '#666',
    marginBottom: 12,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaText: {
    color: '#666',
  },
  tickerContainer: {
    marginBottom: 12,
  },
  tickerLabel: {
    color: '#666',
    marginBottom: 4,
  },
  tickerChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tickerChip: {
    marginRight: 4,
  },
  divider: {
    marginVertical: 12,
  },
  shareActions: {
    marginTop: 8,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  inlineLabel: {
    color: '#666',
  },
  messageContent: {
    marginBottom: 8,
  },
  messageContext: {
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  messageMeta: {
    marginBottom: 8,
  },
  chartTitle: {
    fontWeight: '500',
    marginBottom: 8,
  },
  chartDescription: {
    color: '#666',
    marginBottom: 12,
  },
  chartMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});
