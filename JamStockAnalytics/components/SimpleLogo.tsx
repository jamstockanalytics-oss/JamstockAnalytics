import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface SimpleLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export function SimpleLogo({ size = 'medium', showText = true }: SimpleLogoProps) {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { circle: 30, fontSize: 8, textSize: 6 };
      case 'large':
        return { circle: 80, fontSize: 16, textSize: 12 };
      default:
        return { circle: 60, fontSize: 12, textSize: 10 };
    }
  };

  const { circle, textSize } = getSize();

  return (
    <View style={styles.container}>
      {/* Logo Circle */}
      <View style={[
        styles.logoCircle,
        {
          width: circle,
          height: circle,
          borderRadius: circle / 2,
          borderWidth: circle / 15,
        }
      ]}>
        {/* Simple Chart Representation */}
        <View style={styles.chartContainer}>
          <View style={[styles.bar, { height: circle * 0.2 }]} />
          <View style={[styles.bar, { height: circle * 0.3 }]} />
          <View style={[styles.bar, { height: circle * 0.4 }]} />
        </View>
        
        {/* Simple Arrow */}
        <View style={[styles.arrow, { 
          borderLeftWidth: circle / 10,
          borderRightWidth: circle / 10,
          borderBottomWidth: circle / 8,
        }]} />
      </View>
      
      {showText && (
        <Text style={[
          styles.logoText, 
          { 
            fontSize: textSize,
            marginTop: circle / 8,
          }
        ]}>
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
    borderColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    width: 4,
    backgroundColor: '#00FF00',
    borderRadius: 1,
  },
  arrow: {
    position: 'absolute',
    top: '60%',
    right: '20%',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFD700',
    transform: [{ rotate: '45deg' }],
  },
  logoText: {
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
