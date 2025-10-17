import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { WebTheme } from '../../constants/WebTheme';

interface LightweightLayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function LightweightLayout({
  children,
  title,
  showHeader = true,
  showFooter = true,
  maxWidth = 'xl'
}: LightweightLayoutProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Monitor online status for web
    if (Platform.OS === 'web') {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
    return () => {}; // Empty cleanup function for non-web platforms
  }, []);

  const getMaxWidthValue = (): number | string => {
    const maxWidthMap = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
      full: '100%'
    };
    return maxWidthMap[maxWidth];
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: WebTheme.colors.background,
    },
    webContainer: {
      minHeight: '100%',
      backgroundColor: WebTheme.colors.background,
    },
    header: {
      backgroundColor: WebTheme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: WebTheme.colors.border,
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    webHeader: {
      backgroundColor: WebTheme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: WebTheme.colors.border,
      position: 'sticky',
      top: 0,
      zIndex: 50,
      paddingVertical: 16,
    },
    headerContent: {
      maxWidth: getMaxWidthValue() as any,
      alignSelf: 'center',
      width: '100%',
      paddingHorizontal: 20,
    },
    webHeaderContent: {
      alignSelf: 'center',
      width: '100%',
      paddingHorizontal: 20,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    logo: {
      width: 32,
      height: 32,
      backgroundColor: WebTheme.colors.primary,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      color: WebTheme.colors.background,
      fontWeight: 'bold',
      fontSize: 14,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: WebTheme.colors.text,
    },
    content: {
      flex: 1,
      maxWidth: getMaxWidthValue() as any,
      alignSelf: 'center',
      width: '100%',
      paddingHorizontal: 20,
    },
    footer: {
      backgroundColor: WebTheme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: WebTheme.colors.border,
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    footerContent: {
      maxWidth: getMaxWidthValue() as any,
      alignSelf: 'center',
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerText: {
      fontSize: 12,
      color: WebTheme.colors.textSecondary,
      textAlign: 'center',
    },
    offlineIndicator: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: WebTheme.colors.error,
      paddingVertical: 4,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    offlineText: {
      color: WebTheme.colors.error,
      fontSize: 12,
      fontWeight: '500',
    },
  });

  // For web, render optimized React Native Web structure
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webContainer, { opacity: isOnline ? 1 : 0.75 } as any]}>
        {!isOnline && (
          <View style={styles.offlineIndicator}>
            <Text style={styles.offlineText}>You're currently offline</Text>
          </View>
        )}
        
        {showHeader && (
          <View style={styles.webHeader}>
            <View style={[styles.webHeaderContent, { maxWidth: getMaxWidthValue() as any }]}>
              <View style={styles.headerRow}>
                <View style={styles.logoContainer}>
                  <View style={styles.logo}>
                    <Text style={styles.logoText}>JS</Text>
                  </View>
                  {title && (
                    <Text style={styles.title}>{title}</Text>
                  )}
                </View>
                
                <View style={styles.logoContainer}>
                  <Text style={styles.footerText}>JamStock Analytics</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={[styles.content, { maxWidth: getMaxWidthValue() as any }]}>
          {children}
        </View>

        {showFooter && (
          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <Text style={styles.footerText}>
                © 2024 JamStock Analytics. Optimized for performance.
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  // For mobile, render standard React Native structure
  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>You're currently offline</Text>
        </View>
      )}
      
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerRow}>
              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  <Text style={styles.logoText}>JS</Text>
                </View>
                {title && (
                  <Text style={styles.title}>{title}</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={styles.content}>
        {children}
      </View>

      {showFooter && (
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Text style={styles.footerText}>
              © 2024 JamStock Analytics
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}