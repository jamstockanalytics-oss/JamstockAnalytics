import React, { ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { IconButton } from 'react-native-paper';

interface SideNavigationProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function SideNavigation({ children, isOpen, onClose }: SideNavigationProps) {
  const router = useRouter();

  const navigationItems = [
    { label: 'Dashboard', icon: 'home', route: '/(tabs)' },
    { label: 'Market', icon: 'chart-line', route: '/(tabs)/market' },
    { label: 'News', icon: 'newspaper', route: '/(tabs)/index' },
    { label: 'Chat', icon: 'chat', route: '/(tabs)/chat' },
    { label: 'Analysis', icon: 'chart-box', route: '/(tabs)/ai-analysis' },
    { label: 'Brokers', icon: 'bank', route: '/(tabs)/brokers' },
    { label: 'Profile', icon: 'account', route: '/(tabs)/profile' },
  ];

  if (!isOpen) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      <View style={styles.sideNav}>
        <View style={styles.header}>
          <Text style={styles.title}>Navigation</Text>
          <IconButton
            icon="close"
            size={24}
            onPress={onClose}
            iconColor="#666"
          />
        </View>
        
        <View style={styles.navItems}>
          {navigationItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              onPress={() => {
                router.push(item.route as any);
                onClose();
              }}
            >
              <IconButton
                icon={item.icon}
                size={20}
                iconColor="#333"
              />
              <Text style={styles.navLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sideNav: {
    width: 280,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  navItems: {
    paddingVertical: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
