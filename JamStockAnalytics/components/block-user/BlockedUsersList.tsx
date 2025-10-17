import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useBlockUser } from '../../lib/hooks/useBlockUser';
import { BlockedUser } from '../../lib/services/block-user-service';

interface BlockedUsersListProps {
  onRefresh?: () => void;
}

export function BlockedUsersList({ onRefresh }: BlockedUsersListProps) {
  const { blockedUsers, isLoading, unblockUser, refreshBlockedUsers } = useBlockUser();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshBlockedUsers();
      onRefresh?.();
    } finally {
      setRefreshing(false);
    }
  };

  const handleUnblockUser = (user: BlockedUser) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${user.blocked_user_name}? They will be able to see your activity again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          style: 'default',
          onPress: async () => {
            const success = await unblockUser(user.blocked_user_id);
            if (success) {
              Alert.alert('Success', `${user.blocked_user_name} has been unblocked.`);
            } else {
              Alert.alert('Error', 'Failed to unblock user. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'harassment':
        return '#e74c3c';
      case 'spam':
        return '#f39c12';
      case 'inappropriate_content':
        return '#9b59b6';
      case 'misinformation':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'harassment':
        return 'Harassment';
      case 'spam':
        return 'Spam';
      case 'inappropriate_content':
        return 'Inappropriate Content';
      case 'misinformation':
        return 'Misinformation';
      case 'other':
        return 'Other';
      default:
        return reason;
    }
  };

  const renderBlockedUser = ({ item }: { item: BlockedUser }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{item.blocked_user_name}</Text>
          <View style={[styles.reasonBadge, { backgroundColor: getReasonColor(item.reason) }]}>
            <Text style={styles.reasonText}>{getReasonLabel(item.reason)}</Text>
          </View>
        </View>
        <Text style={styles.userEmail}>{item.blocked_user_email}</Text>
        <Text style={styles.blockedDate}>
          Blocked on {formatDate(item.blocked_at)}
        </Text>
        {item.expires_at && (
          <Text style={styles.expiryDate}>
            Expires on {formatDate(item.expires_at)}
          </Text>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblockUser(item)}
      >
        <MaterialIcons name="person-add" size={20} color="#27ae60" />
        <Text style={styles.unblockButtonText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="block" size={64} color="#bdc3c7" />
      <Text style={styles.emptyStateTitle}>No Blocked Users</Text>
      <Text style={styles.emptyStateText}>
        You haven't blocked any users yet. Blocked users will appear here.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Blocked Users</Text>
        <Text style={styles.subtitle}>
          {blockedUsers.length} user{blockedUsers.length !== 1 ? 's' : ''} blocked
        </Text>
      </View>

      <FlatList
        data={blockedUsers}
        renderItem={renderBlockedUser}
        keyExtractor={(item) => item.blocked_user_id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={handleRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContainer,
          blockedUsers.length === 0 && styles.emptyListContainer,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  reasonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reasonText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  blockedDate: {
    fontSize: 12,
    color: '#999',
  },
  expiryDate: {
    fontSize: 12,
    color: '#f39c12',
    fontWeight: '500',
  },
  unblockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  unblockButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#27ae60',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },
});
