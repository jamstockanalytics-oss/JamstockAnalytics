import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Menu, Chip, Text } from 'react-native-paper';
import { SocialSharingService, SOCIAL_PLATFORMS, SocialPlatform, ShareableContent } from '../../lib/services/social-sharing-service';

interface SocialShareButtonProps {
  content: ShareableContent;
  variant?: 'button' | 'chip' | 'icon';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  onShare?: (platform: string) => void;
  onError?: (error: string) => void;
}

export const SocialShareButton: React.FC<SocialShareButtonProps> = ({
  content,
  variant = 'button',
  size = 'medium',
  showLabel = true,
  onShare,
  onError,
}) => {
  const [sharing, setSharing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleShare = async (platform: SocialPlatform) => {
    try {
      setSharing(true);
      setShowMenu(false);

      const result = await SocialSharingService.shareToPlatform(platform, content);
      
      if (result.success) {
        if (onShare) {
          onShare(platform.id);
        }
        Alert.alert('Success', `Shared to ${platform.name}`);
      } else {
        if (onError) {
          onError(result.error || 'Failed to share');
        }
        Alert.alert('Error', result.error || 'Failed to share content');
      }
    } catch (error) {
      if (onError) {
        onError('An unexpected error occurred');
      }
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSharing(false);
    }
  };

  const handleNativeShare = async () => {
    try {
      setSharing(true);
      const result = await SocialSharingService.shareNative(content);
      
      if (result.success) {
        if (onShare) {
          onShare('native');
        }
      } else {
        if (onError) {
          onError(result.error || 'Failed to share');
        }
        Alert.alert('Error', result.error || 'Failed to share content');
      }
    } catch (error) {
      if (onError) {
        onError('An unexpected error occurred');
      }
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSharing(false);
    }
  };

  const renderButton = () => {
    if (sharing) {
      return (
        <Button
          mode="outlined"
          loading
          disabled
          icon="share"
          style={[styles.button, styles[`${size}Button`]]}
        >
          Sharing...
        </Button>
      );
    }

    if (variant === 'chip') {
      return (
        <Chip
          icon="share"
          onPress={() => setShowMenu(true)}
          style={[styles.chip, styles[`${size}Chip`]]}
        >
          {showLabel ? 'Share' : ''}
        </Chip>
      );
    }

    if (variant === 'icon') {
      return (
        <Button
          mode="text"
          onPress={() => setShowMenu(true)}
          icon="share"
          style={[styles.iconButton, styles[`${size}Button`]]}
          compact
        >
          {showLabel ? 'Share' : ''}
        </Button>
      );
    }

    return (
      <Button
        mode="contained"
        onPress={() => setShowMenu(true)}
        icon="share"
        style={[styles.button, styles[`${size}Button`]]}
      >
        {showLabel ? 'Share' : ''}
      </Button>
    );
  };

  return (
    <View style={styles.container}>
      {renderButton()}
      
      <Menu
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        anchor={renderButton()}
        style={styles.menu}
      >
        <Menu.Item
          onPress={handleNativeShare}
          title="Share via..."
          leadingIcon="share"
          titleStyle={styles.menuItemTitle}
        />
        
        {SOCIAL_PLATFORMS.map((platform) => (
          <Menu.Item
            key={platform.id}
            onPress={() => handleShare(platform)}
            title={platform.name}
            leadingIcon={platform.icon}
            titleStyle={[styles.menuItemTitle, { color: platform.color }]}
          />
        ))}
      </Menu>
    </View>
  );
};

export const QuickShareButtons: React.FC<{
  content: ShareableContent;
  platforms?: string[];
  onShare?: (platform: string) => void;
}> = ({ content, platforms = ['twitter', 'facebook', 'whatsapp'], onShare }) => {
  const [sharing, setSharing] = useState<string | null>(null);

  const handleQuickShare = async (platformId: string) => {
    const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
    if (!platform) return;

    try {
      setSharing(platformId);
      const result = await SocialSharingService.shareToPlatform(platform, content);
      
      if (result.success && onShare) {
        onShare(platformId);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share content');
    } finally {
      setSharing(null);
    }
  };

  return (
    <View style={styles.quickShareContainer}>
      {platforms.map((platformId) => {
        const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
        if (!platform) return null;

        return (
          <Chip
            key={platform.id}
            icon={platform.icon}
            onPress={() => handleQuickShare(platform.id)}
            style={[
              styles.quickChip,
              { backgroundColor: platform.color + '20' }
            ]}
            textStyle={{ color: platform.color }}
            disabled={sharing !== null}
          >
            {platform.name}
          </Chip>
        );
      })}
    </View>
  );
};

export const ShareableContentPreview: React.FC<{
  content: ShareableContent;
  onShare?: (platform: string) => void;
}> = ({ content, onShare }) => {
  return (
    <View style={styles.previewContainer}>
      <Text variant="titleMedium" style={styles.previewTitle}>
        {content.title}
      </Text>
      
      {content.description && (
        <Text variant="bodyMedium" style={styles.previewDescription}>
          {content.description}
        </Text>
      )}
      
      {content.hashtags && content.hashtags.length > 0 && (
        <View style={styles.hashtagContainer}>
          {content.hashtags.map((tag, index) => (
            <Chip
              key={index}
              mode="outlined"
              compact
              style={styles.hashtagChip}
            >
              #{tag}
            </Chip>
          ))}
        </View>
      )}
      
      <View style={styles.previewActions}>
        <QuickShareButtons
          content={content}
          platforms={['twitter', 'facebook', 'whatsapp']}
          onShare={onShare || (() => {})}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  button: {
    borderRadius: 8,
  },
  chip: {
    borderRadius: 16,
  },
  iconButton: {
    minWidth: 40,
  },
  smallButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mediumButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  largeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  smallChip: {
    height: 32,
  },
  mediumChip: {
    height: 40,
  },
  largeChip: {
    height: 48,
  },
  menu: {
    marginTop: 8,
  },
  menuItemTitle: {
    fontSize: 14,
  },
  quickShareContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  quickChip: {
    marginRight: 8,
  },
  previewContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 8,
  },
  previewTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  previewDescription: {
    color: '#666',
    marginBottom: 12,
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 12,
  },
  hashtagChip: {
    marginRight: 4,
  },
  previewActions: {
    marginTop: 8,
  },
});
