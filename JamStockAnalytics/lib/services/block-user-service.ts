import { supabase } from '../supabase/client';

export interface UserBlock {
  id: string;
  blocker_id: string;
  blocked_id: string;
  reason: BlockReason;
  reason_details?: string;
  is_active: boolean;
  blocked_at: string;
  unblocked_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BlockedUser {
  blocked_user_id: string;
  blocked_user_name: string;
  blocked_user_email: string;
  reason: BlockReason;
  blocked_at: string;
  expires_at?: string;
}

export type BlockReason = 
  | 'harassment' 
  | 'spam' 
  | 'inappropriate_content' 
  | 'misinformation' 
  | 'other';

export interface BlockUserData {
  blocked_user_id: string;
  reason: BlockReason;
  reason_details?: string;
  expires_at?: string; // ISO date string, null for permanent block
}

export interface Comment {
  comment_id: string;
  article_id: string;
  user_id: string;
  content: string;
  created_at: string;
  like_count: number;
  reply_count: number;
}

class BlockUserService {
  /**
   * Block a user
   */
  async blockUser(blockData: BlockUserData): Promise<UserBlock> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user is already blocked
      const existingBlock = await this.isUserBlocked(user.id, blockData.blocked_user_id);
      if (existingBlock) {
        throw new Error('User is already blocked');
      }

      const { data, error } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: user.id,
          blocked_id: blockData.blocked_user_id,
          reason: blockData.reason,
          reason_details: blockData.reason_details,
          expires_at: blockData.expires_at || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(blockedUserId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.rpc('unblock_user', {
        blocker_uuid: user.id,
        blocked_uuid: blockedUserId
      });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  }

  /**
   * Check if a user is blocked
   */
  async isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_user_blocked', {
        blocker_uuid: blockerId,
        blocked_uuid: blockedId
      });

      if (error) {
        throw error;
      }

      return data || false;
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      return false;
    }
  }

  /**
   * Get all blocked users for the current user
   */
  async getBlockedUsers(): Promise<BlockedUser[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_blocked_users', {
        user_uuid: user.id
      });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting blocked users:', error);
      throw error;
    }
  }

  /**
   * Get filtered comments for the current user (excluding blocked users)
   */
  async getFilteredComments(articleId?: string): Promise<Comment[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      let query = supabase.rpc('filter_comments_for_user', {
        user_uuid: user.id
      });

      if (articleId) {
        // Filter by article if provided
        const { data: allComments, error } = await query;
        if (error) throw error;
        
        return (allComments || []).filter((comment: any) => comment.article_id === articleId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting filtered comments:', error);
      throw error;
    }
  }

  /**
   * Get user block history
   */
  async getBlockHistory(): Promise<UserBlock[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_blocks')
        .select('*')
        .eq('blocker_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting block history:', error);
      throw error;
    }
  }

  /**
   * Check if current user can interact with another user
   */
  async canInteractWithUser(otherUserId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.id === otherUserId) {
        return true; // Can interact with self or if not authenticated
      }

      return !(await this.isUserBlocked(user.id, otherUserId));
    } catch (error) {
      console.error('Error checking user interaction permissions:', error);
      return false; // Default to blocking interaction on error
    }
  }

  /**
   * Get block reasons with descriptions
   */
  getBlockReasons(): Array<{ value: BlockReason; label: string; description: string }> {
    return [
      {
        value: 'harassment',
        label: 'Harassment',
        description: 'User is engaging in harassment or bullying behavior'
      },
      {
        value: 'spam',
        label: 'Spam',
        description: 'User is posting spam or irrelevant content'
      },
      {
        value: 'inappropriate_content',
        label: 'Inappropriate Content',
        description: 'User is posting inappropriate or offensive content'
      },
      {
        value: 'misinformation',
        label: 'Misinformation',
        description: 'User is spreading false or misleading information'
      },
      {
        value: 'other',
        label: 'Other',
        description: 'Other reason not listed above'
      }
    ];
  }
}

export const blockUserService = new BlockUserService();
