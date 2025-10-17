import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase/client";
import { Platform } from 'react-native';
import { userProfileService } from "../lib/services/user-profile-service";
import { UserProfileData } from "../lib/types/user-profile";

type AuthContextValue = {
  session: import("@supabase/supabase-js").Session | null;
  loading: boolean;
  user: any;
  userProfile: UserProfileData | null;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isGuest: boolean;
  continueAsGuest: () => void;
};

const AuthContext = createContext<AuthContextValue>({ 
  session: null, 
  loading: true,
  user: null,
  userProfile: null,
  profileLoading: false,
  refreshProfile: async () => {},
  signInWithGoogle: async () => {},
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  isGuest: false,
  continueAsGuest: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<import("@supabase/supabase-js").Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

  const refreshProfile = async () => {
    if (!session?.user?.id) {
      setUserProfile(null);
      return;
    }
    
    try {
      setProfileLoading(true);
      const { data, error } = await userProfileService.getUserProfile();
      
      if (data && !error) {
        const profileData: UserProfileData = {
          investment_experience: data.investment_experience,
          risk_tolerance: data.risk_tolerance,
          preferred_sectors: data.preferred_sectors,
          investment_goals: data.investment_goals
        };
        
        if (data.bio) profileData.bio = data.bio;
        if (data.profile_image_url) profileData.profile_image_url = data.profile_image_url;
        if (data.portfolio_size_range) profileData.portfolio_size_range = data.portfolio_size_range;
        
        setUserProfile(profileData);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error loading profile in AuthContext:', error);
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setSession(data.session);
      setLoading(false);
      
      // Load user profile if session exists
      if (data.session) {
        await refreshProfile();
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      
      // Load or clear profile based on session
      if (newSession) {
        await refreshProfile();
      } else {
        setUserProfile(null);
      }
    });
    
    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      // For web, use a simple redirect approach
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: Platform.OS === 'web' ? {
          redirectTo: window.location.origin,
        } : {},
      });

      if (error) {
        console.error('Google sign-in error:', error);
        throw error;
      }

      // For web, redirect to Google OAuth
      if (Platform.OS === 'web' && data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: fullName ? {
          data: {
            full_name: fullName
          }
        } : undefined
      });
      if (error) throw error;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUserProfile(null); // Clear profile on sign out
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const user = session?.user || null;

  const value = useMemo(() => ({ 
    session, 
    loading, 
    user,
    userProfile,
    profileLoading,
    refreshProfile,
    signInWithGoogle,
    signIn,
    signUp,
    signOut,
    isGuest: !session,
    continueAsGuest: () => {
      // Guest mode implementation - just set loading to false
      setLoading(false);
    }
  }), [session, loading, user, userProfile, profileLoading]);
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}


