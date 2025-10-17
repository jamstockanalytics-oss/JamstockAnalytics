import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlockUserModal } from './BlockUserModal';

interface BlockUserButtonProps {
  userId: string;
  userName: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'text' | 'both';
  onBlockSuccess?: () => void;
  disabled?: boolean;
}

export function BlockUserButton({
  userId,
  userName,
  size = 'medium',
  variant = 'both',
  onBlockSuccess,
  disabled = false,
}: BlockUserButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handlePress = () => {
    if (disabled) return;
    setShowModal(true);
  };

  const handleBlockSuccess = () => {
    onBlockSuccess?.();
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 16;
      default:
        return 14;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 6, paddingHorizontal: 8 };
      case 'large':
        return { paddingVertical: 12, paddingHorizontal: 16 };
      default:
        return { paddingVertical: 8, paddingHorizontal: 12 };
    }
  };

  const renderContent = () => {
    if (variant === 'icon') {
      return (
        <MaterialIcons 
          name="block" 
          size={getIconSize()} 
          color={disabled ? '#ccc' : '#e74c3c'} 
        />
      );
    }

    if (variant === 'text') {
      return (
        <Text style={[
          styles.text,
          { fontSize: getFontSize() },
          disabled && styles.textDisabled,
        ]}>
          Block User
        </Text>
      );
    }

    // Both icon and text
    return (
      <>
        <MaterialIcons 
          name="block" 
          size={getIconSize()} 
          color={disabled ? '#ccc' : '#e74c3c'}
          style={styles.icon}
        />
        <Text style={[
          styles.text,
          { fontSize: getFontSize() },
          disabled && styles.textDisabled,
        ]}>
          Block User
        </Text>
      </>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          getPadding(),
          disabled && styles.buttonDisabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {renderContent()}
      </TouchableOpacity>

      <BlockUserModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        userId={userId}
        userName={userName}
        onBlockSuccess={handleBlockSuccess}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e74c3c',
    borderRadius: 8,
    minHeight: 36,
  },
  buttonDisabled: {
    backgroundColor: '#f8f9fa',
    borderColor: '#ccc',
  },
  icon: {
    marginRight: 6,
  },
  text: {
    color: '#e74c3c',
    fontWeight: '500',
  },
  textDisabled: {
    color: '#ccc',
  },
});
