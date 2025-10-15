import { supabase } from '../supabase/client';
import { UserRating, BrokerageWithRating } from './brokerage-service';

export interface RatingSubmission {
  brokerage_id: string;
  user_id: string;
  rating: number; // 1-6 stars
  review_text?: string;
  categories: {
    customer_service: number;
    trading_platform: number;
    fees: number;
    research_quality: number;
    reliability: number;
  };
}

export interface RatingStats {
  average_rating: number;
  total_ratings: number;
  rating_breakdown: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
    '6': number;
  };
  category_ratings: {
    customer_service: number;
    trading_platform: number;
    fees: number;
    research_quality: number;
    reliability: number;
  };
}

export async function submitRating(rating: RatingSubmission): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user has already rated this brokerage
    const { data: existingRating } = await supabase
      .from('brokerage_ratings')
      .select('id')
      .eq('brokerage_id', rating.brokerage_id)
      .eq('user_id', rating.user_id)
      .single();

    if (existingRating) {
      // Update existing rating
      const { error } = await supabase
        .from('brokerage_ratings')
        .update({
          rating: rating.rating,
          review_text: rating.review_text,
          categories: rating.categories,
          updated_at: new Date().toISOString()
        })
        .eq('brokerage_id', rating.brokerage_id)
        .eq('user_id', rating.user_id);

      if (error) throw error;
    } else {
      // Create new rating
      const { error } = await supabase
        .from('brokerage_ratings')
        .insert({
          brokerage_id: rating.brokerage_id,
          user_id: rating.user_id,
          rating: rating.rating,
          review_text: rating.review_text,
          categories: rating.categories,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error submitting rating:', error);
    return { success: false, error: 'Failed to submit rating' };
  }
}

export async function getBrokerageRatings(brokerageId: string): Promise<RatingStats> {
  try {
    const { data: ratings, error } = await supabase
      .from('brokerage_ratings')
      .select('rating, categories')
      .eq('brokerage_id', brokerageId);

    if (error) throw error;

    if (!ratings || ratings.length === 0) {
      return {
        average_rating: 0,
        total_ratings: 0,
        rating_breakdown: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 },
        category_ratings: {
          customer_service: 0,
          trading_platform: 0,
          fees: 0,
          research_quality: 0,
          reliability: 0
        }
      };
    }

    // Calculate average rating
    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = totalRating / ratings.length;

    // Calculate rating breakdown
    const ratingBreakdown = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 };
    ratings.forEach(rating => {
      const key = rating.rating.toString() as keyof typeof ratingBreakdown;
      ratingBreakdown[key]++;
    });

    // Calculate category ratings
    const categoryTotals = {
      customer_service: 0,
      trading_platform: 0,
      fees: 0,
      research_quality: 0,
      reliability: 0
    };

    ratings.forEach(rating => {
      if (rating.categories) {
        categoryTotals.customer_service += rating.categories.customer_service || 0;
        categoryTotals.trading_platform += rating.categories.trading_platform || 0;
        categoryTotals.fees += rating.categories.fees || 0;
        categoryTotals.research_quality += rating.categories.research_quality || 0;
        categoryTotals.reliability += rating.categories.reliability || 0;
      }
    });

    const categoryRatings = {
      customer_service: categoryTotals.customer_service / ratings.length,
      trading_platform: categoryTotals.trading_platform / ratings.length,
      fees: categoryTotals.fees / ratings.length,
      research_quality: categoryTotals.research_quality / ratings.length,
      reliability: categoryTotals.reliability / ratings.length
    };

    return {
      average_rating: Math.round(averageRating * 10) / 10,
      total_ratings: ratings.length,
      rating_breakdown: ratingBreakdown,
      category_ratings
    };
  } catch (error) {
    console.error('Error getting brokerage ratings:', error);
    return {
      average_rating: 0,
      total_ratings: 0,
      rating_breakdown: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 },
      category_ratings: {
        customer_service: 0,
        trading_platform: 0,
        fees: 0,
        research_quality: 0,
        reliability: 0
      }
    };
  }
}

export async function getUserRating(brokerageId: string, userId: string): Promise<UserRating | null> {
  try {
    const { data: rating, error } = await supabase
      .from('brokerage_ratings')
      .select('*')
      .eq('brokerage_id', brokerageId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return rating;
  } catch (error) {
    console.error('Error getting user rating:', error);
    return null;
  }
}

export async function getRecentRatings(brokerageId: string, limit: number = 10): Promise<UserRating[]> {
  try {
    const { data: ratings, error } = await supabase
      .from('brokerage_ratings')
      .select('*')
      .eq('brokerage_id', brokerageId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return ratings || [];
  } catch (error) {
    console.error('Error getting recent ratings:', error);
    return [];
  }
}

export async function getTopRatedBrokerages(limit: number = 10): Promise<BrokerageWithRating[]> {
  try {
    // This would require a more complex query to join brokerages with ratings
    // For now, return empty array as this would need database setup
    return [];
  } catch (error) {
    console.error('Error getting top rated brokerages:', error);
    return [];
  }
}

export async function deleteRating(brokerageId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('brokerage_ratings')
      .delete()
      .eq('brokerage_id', brokerageId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting rating:', error);
    return { success: false, error: 'Failed to delete rating' };
  }
}
