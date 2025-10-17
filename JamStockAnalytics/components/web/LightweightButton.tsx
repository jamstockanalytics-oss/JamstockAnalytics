import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform, View } from 'react-native';
import { WebTheme } from '../../constants/WebTheme';

interface LightweightButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export function LightweightButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false
}: LightweightButtonProps) {
  const styles = StyleSheet.create({
    button: {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingVertical: size === 'sm' ? 8 : size === 'lg' ? 16 : 12,
      paddingHorizontal: size === 'sm' ? 16 : size === 'lg' ? 32 : 24,
      minHeight: size === 'sm' ? 36 : size === 'lg' ? 48 : 40,
      width: fullWidth ? '100%' : 'auto',
    },
    webButton: {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingVertical: size === 'sm' ? 8 : size === 'lg' ? 16 : 12,
      paddingHorizontal: size === 'sm' ? 16 : size === 'lg' ? 32 : 24,
      minHeight: size === 'sm' ? 36 : size === 'lg' ? 48 : 40,
      width: fullWidth ? '100%' : 'auto',
      cursor: disabled ? 'not-allowed' : 'pointer',
    },
    primary: {
      backgroundColor: WebTheme.colors.primary,
    },
    secondary: {
      backgroundColor: WebTheme.colors.secondary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: WebTheme.colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    disabled: {
      backgroundColor: WebTheme.colors.surfaceVariant,
      opacity: 0.6,
    },
    webDisabled: {
      backgroundColor: WebTheme.colors.surfaceVariant,
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    text: {
      fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    primaryText: {
      color: WebTheme.colors.background,
    },
    secondaryText: {
      color: WebTheme.colors.background,
    },
    outlineText: {
      color: WebTheme.colors.primary,
    },
    ghostText: {
      color: WebTheme.colors.primary,
    },
    disabledText: {
      color: WebTheme.colors.textSecondary,
    },
    loadingContainer: {
      marginRight: 8,
    },
  });

  const getButtonStyle = () => {
    const baseStyle = Platform.OS === 'web' ? styles.webButton : styles.button;
    const variantStyle = disabled 
      ? (Platform.OS === 'web' ? styles.webDisabled : styles.disabled)
      : styles[variant];

    return [baseStyle, variantStyle];
  };

  const getTextStyle = () => {
    const baseStyle = styles.text;
    const variantStyle = disabled ? styles.disabledText : styles[`${variant}Text`];
    return [baseStyle, variantStyle];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={variant === 'primary' || variant === 'secondary' 
              ? WebTheme.colors.background 
              : WebTheme.colors.primary}
          />
        </View>
      )}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
}