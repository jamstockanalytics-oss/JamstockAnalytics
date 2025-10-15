import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export function Logo({ size = 'medium', showText = true }: LogoProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { 
          containerSize: 40, 
          circleSize: 30, 
          fontSize: 8, 
          barWidth: 2, 
          barHeight1: 6, 
          barHeight2: 8, 
          barHeight3: 10 
        };
      case 'large':
        return { 
          containerSize: 120, 
          circleSize: 80, 
          fontSize: 16, 
          barWidth: 6, 
          barHeight1: 16, 
          barHeight2: 20, 
          barHeight3: 24 
        };
      default:
        return { 
          containerSize: 80, 
          circleSize: 60, 
          fontSize: 12, 
          barWidth: 4, 
          barHeight1: 8, 
          barHeight2: 12, 
          barHeight3: 16 
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, { width: sizeStyles.containerSize, height: sizeStyles.containerSize }]}>
      {/* Logo Circle */}
      <View style={[
        styles.logoCircle, 
        { 
          width: sizeStyles.circleSize, 
          height: sizeStyles.circleSize, 
          borderRadius: sizeStyles.circleSize / 2 
        }
      ]}>
        {/* Chart Bars */}
        <View style={styles.chartContainer}>
          <View style={[
            styles.bar, 
            { 
              width: sizeStyles.barWidth, 
              height: sizeStyles.barHeight1 
            }
          ]} />
          <View style={[
            styles.bar, 
            { 
              width: sizeStyles.barWidth, 
              height: sizeStyles.barHeight2 
            }
          ]} />
          <View style={[
            styles.bar, 
            { 
              width: sizeStyles.barWidth, 
              height: sizeStyles.barHeight3 
            }
          ]} />
        </View>
        
        {/* Trend Arrow */}
        <View style={styles.arrowContainer}>
          <View style={[
            styles.trendLine, 
            { 
              width: sizeStyles.barWidth * 2, 
              height: sizeStyles.barHeight3 
            }
          ]} />
          <View style={[
            styles.arrow, 
            { 
              borderLeftWidth: sizeStyles.barWidth, 
              borderRightWidth: sizeStyles.barWidth, 
              borderBottomWidth: sizeStyles.barWidth * 2 
            }
          ]} />
        </View>
      </View>
      
      {showText && (
        <Text style={[styles.logoText, { fontSize: sizeStyles.fontSize }]}>
          JAM STOCK ANALYTICS
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    backgroundColor: '#000',
    borderWidth: 4,
    borderColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bar: {
    backgroundColor: '#00FF00',
    marginHorizontal: 1,
    borderRadius: 1,
  },
  arrowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendLine: {
    position: 'absolute',
    backgroundColor: '#FFD700',
    borderRadius: 1,
    transform: [{ rotate: '15deg' }],
  },
  arrow: {
    position: 'absolute',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFD700',
    transform: [{ rotate: '45deg' }],
  },
  logoText: {
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 1,
  },
});
