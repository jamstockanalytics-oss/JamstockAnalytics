import { useState, useEffect, useCallback } from 'react';
import { blockUserService, Comment } from '../services/block-user-service';

interface UseCommentsReturn {
  // State
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadComments: (articleId?: string) => Promise<void>;
  refreshComments: (articleId?: string) => Promise<void>;
  canViewComment: (userId: string) => boolean;
}

export function useComments(articleId?: string): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load comments (filtered by blocks)
  const loadComments = useCallback(async (targetArticleId?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const filteredComments = await blockUserService.getFilteredComments(
        targetArticleId || articleId
      );
      setComments(filteredComments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load comments';
      setError(errorMessage);
      console.error('Error loading comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  // Refresh comments
  const refreshComments = useCallback(async (targetArticleId?: string) => {
    await loadComments(targetArticleId);
  }, [loadComments]);

  // Check if current user can view a comment from a specific user
  const canViewComment = useCallback((_userId: string): boolean => {
    // This is a local check - the server-side filtering is more comprehensive
    // This is mainly for UI purposes
    return true; // Server handles the actual filtering
  }, []);

  // Load comments on mount and when articleId changes
  useEffect(() => {
    if (articleId) {
      loadComments();
    }
  }, [articleId, loadComments]);

  return {
    // State
    comments,
    isLoading,
    error,
    
    // Actions
    loadComments,
    refreshComments,
    canViewComment,
  };
}
