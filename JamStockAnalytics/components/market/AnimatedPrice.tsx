import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';

interface AnimatedPriceProps {
  price: number;
  change: number;
  changePercent: number;
  previousPrice?: number;
  style?: any;
  showChange?: boolean;
  showPercent?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function AnimatedPrice({
  price,
  change,
  changePercent,
  previousPrice,
  style,
  showChange = true,
  showPercent = true,
  size = 'medium'
}: AnimatedPriceProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const previousPriceRef = useRef(previousPrice);

  useEffect(() => {
    // Only animate if price actually changed
    if (previousPriceRef.current && previousPriceRef.current !== price) {
      // Determine animation color based on change direction
      const targetColor = change > 0 ? 1 : change < 0 ? -1 : 0;
      
      // Animate color change
      Animated.timing(colorAnim, {
        toValue: targetColor,
        duration: 300,
        useNativeDriver: false,
      }).start();

      // Animate scale and fade
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.7,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }

    previousPriceRef.current = price;
  }, [price, change, fadeAnim, scaleAnim, colorAnim]);

  const getChangeColor = () => {
    if (change > 0) return '#4CAF50';
    if (change < 0) return '#F44336';
    return '#666666';
  };

  const getChangeIcon = () => {
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          priceSize: 14,
          changeSize: 12,
          spacing: 2
        };
      case 'large':
        return {
          priceSize: 20,
          changeSize: 16,
          spacing: 4
        };
      default:
        return {
          priceSize: 16,
          changeSize: 14,
          spacing: 3
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.priceContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text
          variant="titleMedium"
          style={[
            styles.priceText,
            {
              fontSize: sizeStyles.priceSize,
              color: getChangeColor(),
            },
          ]}
        >
          J${price.toFixed(2)}
        </Text>
        
        {showChange && (
          <View style={[styles.changeContainer, { marginTop: sizeStyles.spacing }]}>
            <Text
              variant="bodySmall"
              style={[
                styles.changeText,
                {
                  fontSize: sizeStyles.changeSize,
                  color: getChangeColor(),
                },
              ]}
            >
              {getChangeIcon()} {Math.abs(change).toFixed(2)}
              {showPercent && ` (${changePercent.toFixed(2)}%)`}
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

interface PriceChangeIndicatorProps {
  change: number;
  changePercent: number;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export function PriceChangeIndicator({
  change,
  changePercent,
  size = 'medium',
  showIcon = true
}: PriceChangeIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for significant changes
    if (Math.abs(changePercent) > 5) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 }
      ).start();
    }

    // Color animation
    const targetColor = change > 0 ? 1 : change < 0 ? -1 : 0;
    Animated.timing(colorAnim, {
      toValue: targetColor,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [change, changePercent, pulseAnim, colorAnim]);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { fontSize: 12, padding: 4 };
      case 'large':
        return { fontSize: 16, padding: 8 };
      default:
        return { fontSize: 14, padding: 6 };
    }
  };

  const sizeStyles = getSizeStyles();

  const animatedColor = colorAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['#F44336', '#666666', '#4CAF50'],
  });

  const getIcon = () => {
    if (!showIcon) return '';
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  };

  return (
    <Animated.View
      style={[
        styles.indicatorContainer,
        {
          backgroundColor: animatedColor,
          transform: [{ scale: pulseAnim }],
          padding: sizeStyles.padding,
        },
      ]}
    >
      <Text
        style={[
          styles.indicatorText,
          {
            fontSize: sizeStyles.fontSize,
            color: 'white',
          },
        ]}
      >
        {getIcon()} {changePercent.toFixed(2)}%
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontWeight: 'bold',
  },
  changeContainer: {
    alignItems: 'flex-end',
  },
  changeText: {
    fontWeight: '600',
  },
  indicatorContainer: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  indicatorText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
