import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlockUserButton } from './BlockUserButton';
import { useBlockUser } from '../../lib/hooks/useBlockUser';

interface CommentCardProps {
  commentId: string;
  articleId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  content: string;
  createdAt: string;
  likeCount: number;
  replyCount: number;
  isOwnComment?: boolean;
  onLike?: () => void;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CommentCard({
  commentId: _commentId,
  articleId: _articleId,
  userId,
  userName,
  userEmail: _userEmail,
  content,
  createdAt,
  likeCount,
  replyCount,
  isOwnComment = false,
  onLike,
  onReply,
  onEdit,
  onDelete,
}: CommentCardProps) {
  const [showActions, setShowActions] = useState(false);
  const { isUserBlocked } = useBlockUser();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const handleMorePress = () => {
    setShowActions(!showActions);
  };

  const handleBlockUser = () => {
    setShowActions(false);
  };

  const handleReportComment = () => {
    Alert.alert(
      'Report Comment',
      'This comment has been reported for review. Thank you for helping keep our community safe.',
      [{ text: 'OK' }]
    );
    setShowActions(false);
  };

  const handleEditComment = () => {
    onEdit?.();
    setShowActions(false);
  };

  const handleDeleteComment = () => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete?.();
            setShowActions(false);
          },
        },
      ]
    );
  };

  // Don't render if user is blocked
  if (isUserBlocked(userId)) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.timestamp}>{formatDate(createdAt)}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.moreButton}
          onPress={handleMorePress}
        >
          <MaterialIcons name="more-vert" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.content}>{content}</Text>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onLike}
        >
          <MaterialIcons 
            name="thumb-up" 
            size={18} 
            color="#666" 
            style={styles.actionIcon}
          />
          <Text style={styles.actionText}>
            {likeCount > 0 ? likeCount : 'Like'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onReply}
        >
          <MaterialIcons 
            name="reply" 
            size={18} 
            color="#666" 
            style={styles.actionIcon}
          />
          <Text style={styles.actionText}>
            {replyCount > 0 ? `${replyCount} replies` : 'Reply'}
          </Text>
        </TouchableOpacity>
      </View>

      {showActions && (
        <View style={styles.actionsMenu}>
          {!isOwnComment && (
            <>
              <BlockUserButton
                userId={userId}
                userName={userName}
                size="small"
                variant="text"
                onBlockSuccess={handleBlockUser}
              />
              <TouchableOpacity
                style={styles.actionMenuItem}
                onPress={handleReportComment}
              >
                <MaterialIcons name="report" size={18} color="#e74c3c" />
                <Text style={styles.actionMenuText}>Report</Text>
              </TouchableOpacity>
            </>
          )}
          
          {isOwnComment && (
            <>
              <TouchableOpacity
                style={styles.actionMenuItem}
                onPress={handleEditComment}
              >
                <MaterialIcons name="edit" size={18} color="#3498db" />
                <Text style={styles.actionMenuText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionMenuItem}
                onPress={handleDeleteComment}
              >
                <MaterialIcons name="delete" size={18} color="#e74c3c" />
                <Text style={styles.actionMenuText}>Delete</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  moreButton: {
    padding: 4,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionIcon: {
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
  },
  actionsMenu: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  actionMenuText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
  },
});
