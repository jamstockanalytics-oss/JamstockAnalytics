/**
 * User Profile Service
 * Handles user profile operations including API calls to Edge Functions
 */

import { supabase } from '../supabase/client';
import { 
  UserProfileData, 
  UpsertUserProfileResponse, 
  UserProfileResponse,
  validateUserProfile,
  USER_PROFILE_API
} from '../types/user-profile';

export class UserProfileService {
  private static instance: UserProfileService;
  private supabaseUrl: string;

  private constructor() {
    this.supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  }

  public static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  /**
   * Upsert user profile data via Edge Function
   */
  async upsertUserProfile(profileData: UserProfileData): Promise<UpsertUserProfileResponse> {
    try {
      // Validate input data
      const validation = validateUserProfile(profileData);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Validation failed',
          details: validation.errors.join(', ')
        };
      }

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return {
          success: false,
          error: 'Authentication required',
          details: 'Please log in to update your profile'
        };
      }

      // Prepare request
      const requestBody = {
        ...profileData,
        // Ensure arrays are properly formatted
        preferred_sectors: profileData.preferred_sectors || [],
        investment_goals: profileData.investment_goals || []
      };

      // Make API call to Edge Function
      const response = await fetch(`${this.supabaseUrl}/functions/v1${USER_PROFILE_API.ENDPOINT}`, {
        method: USER_PROFILE_API.METHOD,
        headers: {
          ...USER_PROFILE_API.HEADERS,
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(requestBody)
      });

      // Parse response
      const result: UpsertUserProfileResponse = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Request failed',
          details: result.details || `HTTP ${response.status}`
        };
      }

      return result;

    } catch (error) {
      console.error('UserProfileService.upsertUserProfile error:', error);
      return {
        success: false,
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user profile data from database
   */
  async getUserProfile(): Promise<{ data: UserProfileResponse | null; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found
          return { data: null, error: null };
        }
        return { data: null, error: error.message };
      }

      return { data: data as UserProfileResponse, error: null };

    } catch (error) {
      console.error('UserProfileService.getUserProfile error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Update user profile image URL
   */
  async updateProfileImage(imageUrl: string): Promise<UpsertUserProfileResponse> {
    return this.upsertUserProfile({ profile_image_url: imageUrl });
  }

  /**
   * Update user bio
   */
  async updateBio(bio: string): Promise<UpsertUserProfileResponse> {
    return this.upsertUserProfile({ bio });
  }

  /**
   * Update investment preferences
   */
  async updateInvestmentPreferences(preferences: {
    investment_experience?: UserProfileData['investment_experience'];
    risk_tolerance?: UserProfileData['risk_tolerance'];
    preferred_sectors?: UserProfileData['preferred_sectors'];
    investment_goals?: UserProfileData['investment_goals'];
    portfolio_size_range?: UserProfileData['portfolio_size_range'];
  }): Promise<UpsertUserProfileResponse> {
    return this.upsertUserProfile(preferences);
  }

  /**
   * Delete user profile
   */
  async deleteUserProfile(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      console.error('UserProfileService.deleteUserProfile error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Check if user has a profile
   */
  async hasProfile(): Promise<boolean> {
    try {
      const { data, error } = await this.getUserProfile();
      return !error && data !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get profile completion percentage
   */
  async getProfileCompletion(): Promise<{ percentage: number; missingFields: string[] }> {
    try {
      const { data, error } = await this.getUserProfile();
      
      if (error || !data) {
        return { percentage: 0, missingFields: ['profile'] };
      }

      const fields = [
        'bio',
        'profile_image_url',
        'investment_experience',
        'risk_tolerance',
        'preferred_sectors',
        'investment_goals',
        'portfolio_size_range'
      ];

      const missingFields: string[] = [];
      let completedFields = 0;

      fields.forEach(field => {
        const value = data[field as keyof UserProfileResponse];
        if (value === null || value === undefined || 
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'string' && value.trim() === '')) {
          missingFields.push(field);
        } else {
          completedFields++;
        }
      });

      const percentage = Math.round((completedFields / fields.length) * 100);

      return { percentage, missingFields };

    } catch (error) {
      console.error('UserProfileService.getProfileCompletion error:', error);
      return { percentage: 0, missingFields: ['profile'] };
    }
  }
}

// Export singleton instance
export const userProfileService = UserProfileService.getInstance();
