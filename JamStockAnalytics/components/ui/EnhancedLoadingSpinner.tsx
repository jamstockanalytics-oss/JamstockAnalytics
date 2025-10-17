/**
 * Enhanced Loading Spinner Component
 * Optimized for performance with smooth animations
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

interface EnhancedLoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  showProgress?: boolean;
  progress?: number;
  color?: string;
  backgroundColor?: string;
  fullScreen?: boolean;
}


export const EnhancedLoadingSpinner: React.FC<EnhancedLoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...',
  showProgress = false,
  progress = 0,
  color,
  backgroundColor,
  fullScreen = false
}) => {
  const theme = useTheme();
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Continuous spin animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );

    // Pulse animation for the container
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, [spinValue, pulseValue, fadeValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinnerSize = {
    small: 20,
    medium: 40,
    large: 60,
  }[size];

  const containerStyle = [
    styles.container,
    fullScreen && styles.fullScreen,
    backgroundColor && { backgroundColor },
  ];

  const spinnerColor = color || theme.colors.primary;

  return (
    <Animated.View 
      style={[
        containerStyle,
        {
          opacity: fadeValue,
          transform: [{ scale: pulseValue }],
        },
      ]}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.spinnerContainer,
            { transform: [{ rotate: spin }] },
          ]}
        >
          <ActivityIndicator
            size={spinnerSize}
            color={spinnerColor}
            style={styles.spinner}
          />
        </Animated.View>
        
        {message && (
          <Text style={[styles.message, { color: theme.colors.onSurface }]}>
            {message}
          </Text>
        )}
        
        {showProgress && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.outline }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(100, Math.max(0, progress))}%`,
                    backgroundColor: spinnerColor,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.onSurface }]}>
              {Math.round(progress)}%
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerContainer: {
    marginBottom: 16,
  },
  spinner: {
    // Additional spinner styling if needed
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    width: 200,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default EnhancedLoadingSpinner;
