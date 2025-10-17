import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton, Chip } from 'react-native-paper';

interface FallbackIndicatorProps {
  isFallback: boolean;
  errorType?: string;
  onRetry?: () => void;
  showDetails?: boolean;
}

export function FallbackIndicator({ 
  isFallback, 
  errorType, 
  onRetry, 
  showDetails = false 
}: FallbackIndicatorProps) {
  if (!isFallback) return null;

  const getErrorInfo = () => {
    switch (errorType) {
      case 'quota_exceeded':
        return {
          message: 'AI service quota exceeded',
          icon: 'account-alert',
          color: '#FF9800',
          description: 'Using intelligent fallback response'
        };
      case 'rate_limited':
        return {
          message: 'Too many requests',
          icon: 'clock-alert',
          color: '#FF5722',
          description: 'Please wait a moment before trying again'
        };
      case 'service_unavailable':
        return {
          message: 'AI service temporarily unavailable',
          icon: 'wifi-off',
          color: '#F44336',
          description: 'Using fallback response'
        };
      default:
        return {
          message: 'Using fallback response',
          icon: 'information',
          color: '#2196F3',
          description: 'AI service temporarily unavailable'
        };
    }
  };

  const errorInfo = getErrorInfo();

  return (
    <View style={styles.container}>
      <View style={styles.indicator}>
        <IconButton
          icon={errorInfo.icon}
          size={16}
          iconColor={errorInfo.color}
          style={styles.icon}
        />
        <View style={styles.content}>
          <Text style={[styles.message, { color: errorInfo.color }]}>
            {errorInfo.message}
          </Text>
          {showDetails && (
            <Text style={styles.description}>
              {errorInfo.description}
            </Text>
          )}
        </View>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
            <Chip 
              mode="outlined" 
              compact
              textStyle={styles.retryText}
            >
              Retry
            </Chip>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 8,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  icon: {
    margin: 0,
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
    marginLeft: 8,
  },
  message: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  retryButton: {
    marginLeft: 8,
  },
  retryText: {
    fontSize: 10,
  },
});
