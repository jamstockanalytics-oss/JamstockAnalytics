/**
 * Example usage of the User Profile Edge Function
 * This shows how to integrate the upsert-user-profile-wrapper in your React Native app
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { userProfileService } from '../lib/services/user-profile-service';
import { 
  UserProfileData, 
  UpsertUserProfileResponse,
  PORTFOLIO_SIZE_RANGES,
  PREFERRED_SECTORS,
  INVESTMENT_GOALS
} from '../lib/types/user-profile';

interface ProfileFormProps {
  onProfileUpdated?: (profile: UpsertUserProfileResponse) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onProfileUpdated }) => {
  const [formData, setFormData] = useState<UserProfileData>({
    bio: '',
    profile_image_url: '',
    investment_experience: 'beginner',
    risk_tolerance: 'moderate',
    preferred_sectors: [],
    investment_goals: [],
    portfolio_size_range: undefined
  });

  const [loading, setLoading] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<UserProfileData | null>(null);

  useEffect(() => {
    loadCurrentProfile();
  }, []);

  const loadCurrentProfile = async () => {
    try {
      const { data, error } = await userProfileService.getUserProfile();
      if (data && !error) {
        setCurrentProfile(data);
        setFormData({
          bio: data.bio || '',
          profile_image_url: data.profile_image_url || '',
          investment_experience: data.investment_experience,
          risk_tolerance: data.risk_tolerance,
          preferred_sectors: data.preferred_sectors,
          investment_goals: data.investment_goals,
          portfolio_size_range: data.portfolio_size_range || undefined
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);
    try {
      // Call the Edge Function via the service
      const result = await userProfileService.upsertUserProfile(formData);
      
      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully!');
        onProfileUpdated?.(result);
        await loadCurrentProfile(); // Reload the profile
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectorToggle = (sector: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_sectors: prev.preferred_sectors?.includes(sector)
        ? prev.preferred_sectors.filter(s => s !== sector)
        : [...(prev.preferred_sectors || []), sector]
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      investment_goals: prev.investment_goals?.includes(goal as any)
        ? prev.investment_goals.filter(g => g !== goal)
        : [...(prev.investment_goals || []), goal as any]
    }));
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        User Profile
      </Text>

      {/* Bio */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Bio</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 12,
            minHeight: 80,
            textAlignVertical: 'top'
          }}
          value={formData.bio}
          onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
          placeholder="Tell us about yourself..."
          multiline
          maxLength={500}
        />
      </View>

      {/* Profile Image URL */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Profile Image URL</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 12
          }}
          value={formData.profile_image_url}
          onChangeText={(text) => setFormData(prev => ({ ...prev, profile_image_url: text }))}
          placeholder="https://example.com/your-avatar.png"
          keyboardType="url"
        />
      </View>

      {/* Investment Experience */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Investment Experience</Text>
        {(['beginner', 'intermediate', 'advanced', 'expert'] as const).map(level => (
          <TouchableOpacity
            key={level}
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: formData.investment_experience === level ? '#007AFF' : '#ccc',
              borderRadius: 8,
              marginBottom: 8,
              backgroundColor: formData.investment_experience === level ? '#E3F2FD' : 'white'
            }}
            onPress={() => setFormData(prev => ({ ...prev, investment_experience: level }))}
          >
            <Text style={{
              textTransform: 'capitalize',
              color: formData.investment_experience === level ? '#007AFF' : '#000'
            }}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Risk Tolerance */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Risk Tolerance</Text>
        {(['conservative', 'moderate', 'aggressive'] as const).map(level => (
          <TouchableOpacity
            key={level}
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: formData.risk_tolerance === level ? '#007AFF' : '#ccc',
              borderRadius: 8,
              marginBottom: 8,
              backgroundColor: formData.risk_tolerance === level ? '#E3F2FD' : 'white'
            }}
            onPress={() => setFormData(prev => ({ ...prev, risk_tolerance: level }))}
          >
            <Text style={{
              textTransform: 'capitalize',
              color: formData.risk_tolerance === level ? '#007AFF' : '#000'
            }}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Preferred Sectors */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Preferred Sectors</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {PREFERRED_SECTORS.slice(0, 10).map(sector => (
            <TouchableOpacity
              key={sector}
              style={{
                padding: 8,
                margin: 4,
                borderWidth: 1,
                borderColor: formData.preferred_sectors?.includes(sector) ? '#007AFF' : '#ccc',
                borderRadius: 16,
                backgroundColor: formData.preferred_sectors?.includes(sector) ? '#E3F2FD' : 'white'
              }}
              onPress={() => handleSectorToggle(sector)}
            >
              <Text style={{
                fontSize: 12,
                color: formData.preferred_sectors?.includes(sector) ? '#007AFF' : '#000'
              }}>
                {sector}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Investment Goals */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Investment Goals</Text>
        {INVESTMENT_GOALS.slice(0, 6).map(goal => (
          <TouchableOpacity
            key={goal}
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: formData.investment_goals?.includes(goal as any) ? '#007AFF' : '#ccc',
              borderRadius: 8,
              marginBottom: 8,
              backgroundColor: formData.investment_goals?.includes(goal as any) ? '#E3F2FD' : 'white'
            }}
            onPress={() => handleGoalToggle(goal)}
          >
            <Text style={{
              textTransform: 'capitalize',
              color: formData.investment_goals?.includes(goal as any) ? '#007AFF' : '#000'
            }}>
              {goal.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Portfolio Size Range */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Portfolio Size Range</Text>
        {PORTFOLIO_SIZE_RANGES.map(range => (
          <TouchableOpacity
            key={range}
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: formData.portfolio_size_range === range ? '#007AFF' : '#ccc',
              borderRadius: 8,
              marginBottom: 8,
              backgroundColor: formData.portfolio_size_range === range ? '#E3F2FD' : 'white'
            }}
            onPress={() => setFormData(prev => ({ ...prev, portfolio_size_range: range }))}
          >
            <Text style={{
              color: formData.portfolio_size_range === range ? '#007AFF' : '#000'
            }}>
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={{
          backgroundColor: loading ? '#ccc' : '#007AFF',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 20
        }}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
          {loading ? 'Updating...' : 'Update Profile'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Example of direct Edge Function call (alternative approach)
export const directEdgeFunctionCall = async (profileData: UserProfileData) => {
  try {
    // Get Supabase client and session
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session');
    }

    // Call Edge Function directly
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/upsert-user-profile-wrapper`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(profileData),
      }
    );

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Direct Edge Function call error:', error);
    throw error;
  }
};

export default ProfileForm;
