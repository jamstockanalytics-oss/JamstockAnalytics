import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useBlockUser } from '../../lib/hooks/useBlockUser';
import { blockUserService, BlockReason } from '../../lib/services/block-user-service';

interface BlockUserModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  onBlockSuccess?: () => void;
}


export function BlockUserModal({
  visible,
  onClose,
  userId,
  userName,
  onBlockSuccess,
}: BlockUserModalProps) {
  const [selectedReason, setSelectedReason] = useState<BlockReason>('harassment');
  const [reasonDetails, setReasonDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { blockUser } = useBlockUser();
  const blockReasons = blockUserService.getBlockReasons();

  const handleBlockUser = async () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for blocking this user.');
      return;
    }

    Alert.alert(
      'Block User',
      `Are you sure you want to block ${userName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const success = await blockUser({
                blocked_user_id: userId,
                reason: selectedReason,
                reason_details: reasonDetails.trim() || '',
              });

              if (success) {
                Alert.alert('Success', `${userName} has been blocked successfully.`);
                onBlockSuccess?.();
                onClose();
              } else {
                Alert.alert('Error', 'Failed to block user. Please try again.');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    setSelectedReason('harassment');
    setReasonDetails('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Block User</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>
              You are about to block <Text style={styles.userName}>{userName}</Text>
            </Text>
            
            <Text style={styles.description}>
              Blocked users will not be able to see your activity, and you won't see theirs. 
              This action can be reversed later.
            </Text>

            <Text style={styles.sectionTitle}>Reason for blocking:</Text>
            
            {blockReasons.map((reason) => (
              <TouchableOpacity
                key={reason.value}
                style={[
                  styles.reasonOption,
                  selectedReason === reason.value && styles.reasonOptionSelected,
                ]}
                onPress={() => setSelectedReason(reason.value)}
              >
                <View style={styles.reasonContent}>
                  <Text style={[
                    styles.reasonLabel,
                    selectedReason === reason.value && styles.reasonLabelSelected,
                  ]}>
                    {reason.label}
                  </Text>
                  <Text style={[
                    styles.reasonDescription,
                    selectedReason === reason.value && styles.reasonDescriptionSelected,
                  ]}>
                    {reason.description}
                  </Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedReason === reason.value && styles.radioButtonSelected,
                ]}>
                  {selectedReason === reason.value && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionTitle}>Additional details (optional):</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Provide additional context about why you're blocking this user..."
              value={reasonDetails}
              onChangeText={setReasonDetails}
              multiline
              numberOfLines={3}
              maxLength={500}
              textAlignVertical="top"
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.blockButton, isLoading && styles.blockButtonDisabled]}
              onPress={handleBlockUser}
              disabled={isLoading}
            >
              <MaterialIcons 
                name="block" 
                size={20} 
                color="white" 
                style={styles.blockButtonIcon}
              />
              <Text style={styles.blockButtonText}>
                {isLoading ? 'Blocking...' : 'Block User'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  userName: {
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  reasonOptionSelected: {
    borderColor: '#e74c3c',
    backgroundColor: '#fef2f2',
  },
  reasonContent: {
    flex: 1,
    marginRight: 12,
  },
  reasonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  reasonLabelSelected: {
    color: '#e74c3c',
  },
  reasonDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  reasonDescriptionSelected: {
    color: '#c0392b',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#e74c3c',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e74c3c',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
    minHeight: 80,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  blockButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockButtonDisabled: {
    backgroundColor: '#ccc',
  },
  blockButtonIcon: {
    marginRight: 8,
  },
  blockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
