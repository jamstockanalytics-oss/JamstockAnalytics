import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';

interface HorizontalScrollContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  showsHorizontalScrollIndicator?: boolean;
  showsVerticalScrollIndicator?: boolean;
  bounces?: boolean;
  scrollEnabled?: boolean;
  decelerationRate?: 'fast' | 'normal';
  snapToInterval?: number;
  snapToAlignment?: 'start' | 'center' | 'end';
}

export function HorizontalScrollContainer({
  children,
  style,
  contentContainerStyle,
  showsHorizontalScrollIndicator = false,
  showsVerticalScrollIndicator = false,
  bounces = true,
  scrollEnabled = true,
  decelerationRate = 'fast',
  snapToInterval,
  snapToAlignment = 'start'
}: HorizontalScrollContainerProps) {
  return (
    <ScrollView
      horizontal
      style={[styles.container, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      bounces={bounces}
      scrollEnabled={scrollEnabled}
      decelerationRate={decelerationRate}
      snapToInterval={snapToInterval}
      snapToAlignment={snapToAlignment}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
});
