import { useState, useEffect, useCallback } from 'react';
import { blockUserService, BlockedUser, BlockUserData, UserBlock } from '../services/block-user-service';

interface UseBlockUserReturn {
  // State
  blockedUsers: BlockedUser[];
  blockHistory: UserBlock[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  blockUser: (blockData: BlockUserData) => Promise<boolean>;
  unblockUser: (blockedUserId: string) => Promise<boolean>;
  refreshBlockedUsers: () => Promise<void>;
  refreshBlockHistory: () => Promise<void>;
  isUserBlocked: (userId: string) => boolean;
  canInteractWithUser: (userId: string) => Promise<boolean>;
}

export function useBlockUser(): UseBlockUserReturn {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [blockHistory, setBlockHistory] = useState<UserBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load blocked users
  const loadBlockedUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const users = await blockUserService.getBlockedUsers();
      setBlockedUsers(users);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load blocked users';
      setError(errorMessage);
      console.error('Error loading blocked users:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load block history
  const loadBlockHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const history = await blockUserService.getBlockHistory();
      setBlockHistory(history);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load block history';
      setError(errorMessage);
      console.error('Error loading block history:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Block a user
  const blockUser = useCallback(async (blockData: BlockUserData): Promise<boolean> => {
    try {
      setError(null);
      await blockUserService.blockUser(blockData);
      
      // Refresh the blocked users list
      await loadBlockedUsers();
      await loadBlockHistory();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to block user';
      setError(errorMessage);
      console.error('Error blocking user:', err);
      return false;
    }
  }, [loadBlockedUsers, loadBlockHistory]);

  // Unblock a user
  const unblockUser = useCallback(async (blockedUserId: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await blockUserService.unblockUser(blockedUserId);
      
      if (success) {
        // Refresh the blocked users list
        await loadBlockedUsers();
        await loadBlockHistory();
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unblock user';
      setError(errorMessage);
      console.error('Error unblocking user:', err);
      return false;
    }
  }, [loadBlockedUsers, loadBlockHistory]);

  // Check if a user is blocked locally
  const isUserBlocked = useCallback((userId: string): boolean => {
    return blockedUsers.some(user => user.blocked_user_id === userId);
  }, [blockedUsers]);

  // Check if current user can interact with another user
  const canInteractWithUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      return await blockUserService.canInteractWithUser(userId);
    } catch (err) {
      console.error('Error checking user interaction permissions:', err);
      return false;
    }
  }, []);

  // Refresh blocked users
  const refreshBlockedUsers = useCallback(async () => {
    await loadBlockedUsers();
  }, [loadBlockedUsers]);

  // Refresh block history
  const refreshBlockHistory = useCallback(async () => {
    await loadBlockHistory();
  }, [loadBlockHistory]);

  // Load data on mount
  useEffect(() => {
    loadBlockedUsers();
    loadBlockHistory();
  }, [loadBlockedUsers, loadBlockHistory]);

  return {
    // State
    blockedUsers,
    blockHistory,
    isLoading,
    error,
    
    // Actions
    blockUser,
    unblockUser,
    refreshBlockedUsers,
    refreshBlockHistory,
    isUserBlocked,
    canInteractWithUser,
  };
}
