import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FullScrollContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  bounces?: boolean;
  scrollEnabled?: boolean;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  refreshControl?: React.ReactElement<any>;
}

export function FullScrollContainer({
  children,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = true,
  showsHorizontalScrollIndicator = false,
  bounces = true,
  scrollEnabled = true,
  keyboardShouldPersistTaps = 'handled',
  refreshControl
}: FullScrollContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
        contentContainerStyle
      ]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      bounces={bounces}
      scrollEnabled={scrollEnabled}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
});
