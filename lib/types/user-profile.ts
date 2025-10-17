/**
 * User Profile Types for JamStockAnalytics
 * Defines types for user profile data and API responses
 */

export type InvestmentExperience = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';
export type InvestmentGoal = 'long_term' | 'short_term' | 'retirement' | 'education' | 'emergency' | 'wealth_building';

export interface UserProfileData {
  bio?: string;
  profile_image_url?: string;
  investment_experience?: InvestmentExperience;
  risk_tolerance?: RiskTolerance;
  preferred_sectors?: string[];
  investment_goals?: InvestmentGoal[];
  portfolio_size_range?: string;
}

export interface UserProfileResponse {
  profile_id: string;
  user_id: string;
  bio: string | null;
  profile_image_url: string | null;
  investment_experience: InvestmentExperience;
  risk_tolerance: RiskTolerance;
  preferred_sectors: string[];
  investment_goals: InvestmentGoal[];
  portfolio_size_range: string | null;
  created_at: string;
  updated_at: string;
  action_performed: 'inserted' | 'updated';
}

export interface UpsertUserProfileResponse {
  success: boolean;
  data?: UserProfileResponse;
  error?: string;
  message?: string;
  details?: string;
}

export interface UserProfileValidation {
  isValid: boolean;
  errors: string[];
}

// Portfolio size range options
export const PORTFOLIO_SIZE_RANGES = [
  'Under 10k',
  '10k-25k',
  '25k-50k',
  '50k-100k',
  '100k-250k',
  '250k-500k',
  '500k-1M',
  'Over 1M'
] as const;

export type PortfolioSizeRange = typeof PORTFOLIO_SIZE_RANGES[number];

// Preferred sectors options (JSE/Junior Market focused)
export const PREFERRED_SECTORS = [
  'Financial Services',
  'Banking',
  'Insurance',
  'Investment Banking',
  'Consumer Goods',
  'Food & Beverage',
  'Technology',
  'IT Services',
  'Industrial',
  'Manufacturing',
  'Media',
  'Entertainment',
  'Transportation',
  'Healthcare',
  'Retail',
  'Real Estate',
  'Energy',
  'Utilities',
  'Telecommunications',
  'Agriculture'
] as const;

export type PreferredSector = typeof PREFERRED_SECTORS[number];

// Investment goals options
export const INVESTMENT_GOALS = [
  'long_term',
  'short_term',
  'retirement',
  'education',
  'emergency',
  'wealth_building',
  'income_generation',
  'capital_preservation',
  'speculation',
  'diversification'
] as const;

export type InvestmentGoalType = typeof INVESTMENT_GOALS[number];

// Form validation schemas
export const validateUserProfile = (data: UserProfileData): UserProfileValidation => {
  const errors: string[] = [];

  // Validate bio length
  if (data.bio && data.bio.length > 500) {
    errors.push('Bio must be 500 characters or less');
  }

  // Validate profile image URL format
  if (data.profile_image_url && !isValidUrl(data.profile_image_url)) {
    errors.push('Invalid profile image URL format');
  }

  // Validate investment experience
  if (data.investment_experience && !['beginner', 'intermediate', 'advanced', 'expert'].includes(data.investment_experience)) {
    errors.push('Invalid investment experience level');
  }

  // Validate risk tolerance
  if (data.risk_tolerance && !['conservative', 'moderate', 'aggressive'].includes(data.risk_tolerance)) {
    errors.push('Invalid risk tolerance level');
  }

  // Validate preferred sectors
  if (data.preferred_sectors && Array.isArray(data.preferred_sectors)) {
    if (data.preferred_sectors.length > 10) {
      errors.push('Cannot select more than 10 preferred sectors');
    }
    const invalidSectors = data.preferred_sectors.filter(sector => 
      !PREFERRED_SECTORS.includes(sector as PreferredSector)
    );
    if (invalidSectors.length > 0) {
      errors.push(`Invalid sectors: ${invalidSectors.join(', ')}`);
    }
  }

  // Validate investment goals
  if (data.investment_goals && Array.isArray(data.investment_goals)) {
    if (data.investment_goals.length > 5) {
      errors.push('Cannot select more than 5 investment goals');
    }
    const invalidGoals = data.investment_goals.filter(goal => 
      !INVESTMENT_GOALS.includes(goal as InvestmentGoalType)
    );
    if (invalidGoals.length > 0) {
      errors.push(`Invalid goals: ${invalidGoals.join(', ')}`);
    }
  }

  // Validate portfolio size range
  if (data.portfolio_size_range && !PORTFOLIO_SIZE_RANGES.includes(data.portfolio_size_range as PortfolioSizeRange)) {
    errors.push('Invalid portfolio size range');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper function to validate URLs
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Default profile data
export const DEFAULT_USER_PROFILE: UserProfileData = {
  bio: '',
  profile_image_url: '',
  investment_experience: 'beginner',
  risk_tolerance: 'moderate',
  preferred_sectors: [],
  investment_goals: [],
  portfolio_size_range: undefined
};

// API endpoint configuration
export const USER_PROFILE_API = {
  ENDPOINT: '/upsert-user-profile-wrapper',
  METHOD: 'POST' as const,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};
