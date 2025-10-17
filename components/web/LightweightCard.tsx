import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { WebTheme } from '../../constants/WebTheme';

interface LightweightCardProps {
  title?: string;
  subtitle?: string;
  content?: string;
  onPress?: () => void;
  variant?: 'default' | 'outlined' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export function LightweightCard({
  title,
  subtitle,
  content,
  onPress,
  variant = 'default',
  size = 'md',
  children
}: LightweightCardProps) {
  const styles = StyleSheet.create({
    card: {
      backgroundColor: WebTheme.colors.surface,
      borderRadius: 8,
      padding: size === 'sm' ? 12 : size === 'lg' ? 24 : 16,
      marginVertical: 4,
      marginHorizontal: 4,
    },
    outlined: {
      borderWidth: 1,
      borderColor: WebTheme.colors.textSecondary,
    },
    elevated: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    webCard: {
      backgroundColor: WebTheme.colors.surface,
      borderRadius: 8,
      padding: size === 'sm' ? 12 : size === 'lg' ? 24 : 16,
      marginVertical: 4,
      marginHorizontal: 4,
      cursor: onPress ? 'pointer' : 'default',
    },
    webElevated: {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    webOutlined: {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: WebTheme.colors.textSecondary,
    },
    title: {
      fontSize: size === 'sm' ? 14 : size === 'lg' ? 20 : 16,
      fontWeight: '600',
      color: WebTheme.colors.text,
      marginBottom: subtitle ? 4 : 8,
    },
    subtitle: {
      fontSize: size === 'sm' ? 12 : size === 'lg' ? 16 : 14,
      color: WebTheme.colors.textSecondary,
      marginBottom: content ? 8 : 0,
    },
    content: {
      fontSize: size === 'sm' ? 12 : size === 'lg' ? 16 : 14,
      color: WebTheme.colors.text,
      lineHeight: size === 'sm' ? 16 : size === 'lg' ? 24 : 20,
    },
  });

  const getCardStyle = () => {
    const baseStyle = Platform.OS === 'web' ? styles.webCard : styles.card;
    const variantStyle = variant === 'outlined' 
      ? (Platform.OS === 'web' ? styles.webOutlined : styles.outlined)
      : variant === 'elevated' 
      ? (Platform.OS === 'web' ? styles.webElevated : styles.elevated)
      : {};

    return [baseStyle, variantStyle];
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={getCardStyle()}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {title && (
        <Text style={styles.title}>{title}</Text>
      )}
      
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
      
      {content && (
        <Text style={styles.content}>{content}</Text>
      )}
      
      {children}
    </CardComponent>
  );
}