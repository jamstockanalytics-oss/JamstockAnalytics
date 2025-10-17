import { View, ScrollView, Alert } from "react-native";
import { Text, Button, Card, TextInput, SegmentedButtons, Chip, ProgressBar } from "react-native-paper";
import { supabase } from "../../lib/supabase/client";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { fetchSavedArticles, removeSavedArticle, type Article } from "../../lib/services/news-service";
import { useRouter } from "expo-router";
import { SimpleLogo } from "../../components/SimpleLogo";
import { userProfileService } from "../../lib/services/user-profile-service";
import { 
  UserProfileData, 
  UpsertUserProfileResponse,
  PORTFOLIO_SIZE_RANGES,
  PREFERRED_SECTORS,
  INVESTMENT_GOALS
} from "../../lib/types/user-profile";
import { CHART_DESIGNS } from "../../components/charts";
import { SOCIAL_PLATFORMS } from "../../lib/services/social-sharing-service";

export default function ProfileScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showProfileForm, setShowProfileForm] = useState<boolean>(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState<UserProfileData>({
    bio: '',
    profile_image_url: '',
    investment_experience: 'beginner',
    risk_tolerance: 'moderate',
    preferred_sectors: [],
    investment_goals: [],
    portfolio_size_range: ''
  });
  
  // Chart preferences state
  const [chartPreferences, setChartPreferences] = useState({
    defaultDesign: 'professional',
    defaultType: 'line',
    showLegend: true,
    showGrid: true,
    showLabels: true,
    autoRefresh: true,
    refreshInterval: 30
  });
  
  // Social media preferences state
  const [socialPreferences, setSocialPreferences] = useState({
    enabledPlatforms: ['twitter', 'facebook', 'whatsapp'],
    defaultPlatform: 'twitter',
    includeHashtags: true,
    includeAppBranding: true,
    shareAnalytics: false,
    autoShare: false
  });
  
  const [currentProfile, setCurrentProfile] = useState<UserProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [profileCompletion, setProfileCompletion] = useState<{ percentage: number; missingFields: string[] }>({ percentage: 0, missingFields: [] });

  useEffect(() => {
    (async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      const articles = await fetchSavedArticles(session.user.id);
      setSaved(articles);
      setLoading(false);
      
      // Load user profile
      await loadUserProfile();
    })();
  }, [session?.user?.id]);

  const loadUserProfile = async () => {
    if (!session?.user?.id) return;
    
    try {
      setProfileLoading(true);
      const { data, error } = await userProfileService.getUserProfile();
      
      if (data && !error) {
        setCurrentProfile({
          bio: data.bio || '',
          profile_image_url: data.profile_image_url || '',
          investment_experience: data.investment_experience,
          risk_tolerance: data.risk_tolerance,
          preferred_sectors: data.preferred_sectors,
          investment_goals: data.investment_goals,
          portfolio_size_range: data.portfolio_size_range || ''
        });
        setProfileData({
          bio: data.bio || '',
          profile_image_url: data.profile_image_url || '',
          investment_experience: data.investment_experience,
          risk_tolerance: data.risk_tolerance,
          preferred_sectors: data.preferred_sectors,
          investment_goals: data.investment_goals,
          portfolio_size_range: data.portfolio_size_range || ''
        });
      }
      
      // Get profile completion
      const completion = await userProfileService.getProfileCompletion();
      setProfileCompletion(completion);
      
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!session?.user?.id) return;
    
    try {
      setProfileLoading(true);
      const result: UpsertUserProfileResponse = await userProfileService.upsertUserProfile(profileData);
      
      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully!');
        await loadUserProfile(); // Reload the profile
        setShowProfileForm(false);
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Profile update error:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSectorToggle = (sector: string) => {
    setProfileData(prev => ({
      ...prev,
      preferred_sectors: prev.preferred_sectors?.includes(sector)
        ? prev.preferred_sectors.filter(s => s !== sector)
        : [...(prev.preferred_sectors || []), sector]
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setProfileData(prev => ({
      ...prev,
      investment_goals: prev.investment_goals?.includes(goal as any)
        ? prev.investment_goals.filter(g => g !== goal)
        : [...(prev.investment_goals || []), goal as any]
    }));
  };

  if (showProfileForm) {
    return (
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <SimpleLogo size="medium" showText={true} />
        </View>
        
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="headlineSmall" style={{ marginBottom: 16 }}>Edit Profile</Text>
            
            {/* Bio */}
            <TextInput
              label="Bio"
              value={profileData.bio || ''}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
              multiline
              numberOfLines={3}
              style={{ marginBottom: 16 }}
              maxLength={500}
            />
            
            {/* Profile Image URL */}
            <TextInput
              label="Profile Image URL"
              value={profileData.profile_image_url || ''}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, profile_image_url: text }))}
              style={{ marginBottom: 16 }}
              keyboardType="url"
            />
            
            {/* Investment Experience */}
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>Investment Experience</Text>
            <SegmentedButtons
              value={profileData.investment_experience || 'beginner'}
              onValueChange={(value) => setProfileData(prev => ({ ...prev, investment_experience: value as any }))}
              buttons={[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' },
                { value: 'expert', label: 'Expert' },
              ]}
              style={{ marginBottom: 16 }}
            />
            
            {/* Risk Tolerance */}
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>Risk Tolerance</Text>
            <SegmentedButtons
              value={profileData.risk_tolerance || 'moderate'}
              onValueChange={(value) => setProfileData(prev => ({ ...prev, risk_tolerance: value as any }))}
              buttons={[
                { value: 'conservative', label: 'Conservative' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'aggressive', label: 'Aggressive' },
              ]}
              style={{ marginBottom: 16 }}
            />
            
            {/* Preferred Sectors */}
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>Preferred Sectors</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
              {PREFERRED_SECTORS.slice(0, 10).map(sector => (
                <Chip
                  key={sector}
                  selected={profileData.preferred_sectors?.includes(sector) || false}
                  onPress={() => handleSectorToggle(sector)}
                  style={{ margin: 2 }}
                  compact
                >
                  {sector}
                </Chip>
              ))}
            </View>
            
            {/* Investment Goals */}
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>Investment Goals</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
              {INVESTMENT_GOALS.slice(0, 6).map(goal => (
                <Chip
                  key={goal}
                  selected={profileData.investment_goals?.includes(goal as any) || false}
                  onPress={() => handleGoalToggle(goal)}
                  style={{ margin: 2 }}
                  compact
                >
                  {goal.replace('_', ' ')}
                </Chip>
              ))}
            </View>
            
            {/* Portfolio Size Range */}
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>Portfolio Size Range</Text>
            <SegmentedButtons
              value={profileData.portfolio_size_range || ''}
              onValueChange={(value) => setProfileData(prev => ({ ...prev, portfolio_size_range: value || '' }))}
              buttons={PORTFOLIO_SIZE_RANGES.slice(0, 4).map(range => ({
                value: range,
                label: range
              }))}
              style={{ marginBottom: 20 }}
            />
            
            {/* Chart Preferences */}
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>Chart Preferences</Text>
            
            {/* Default Chart Design */}
            <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Default Chart Design</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
              {CHART_DESIGNS.map(design => (
                <Chip
                  key={design.id}
                  selected={chartPreferences.defaultDesign === design.id}
                  onPress={() => setChartPreferences(prev => ({ ...prev, defaultDesign: design.id }))}
                  style={{ margin: 2 }}
                  compact
                >
                  {design.name}
                </Chip>
              ))}
            </View>
            
            {/* Default Chart Type */}
            <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Default Chart Type</Text>
            <SegmentedButtons
              value={chartPreferences.defaultType}
              onValueChange={(value) => setChartPreferences(prev => ({ ...prev, defaultType: value }))}
              buttons={[
                { value: 'line', label: 'Line' },
                { value: 'bar', label: 'Bar' },
                { value: 'area', label: 'Area' },
                { value: 'pie', label: 'Pie' },
              ]}
              style={{ marginBottom: 16 }}
            />
            
            {/* Chart Display Options */}
            <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Display Options</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
              <Chip
                selected={chartPreferences.showLegend}
                onPress={() => setChartPreferences(prev => ({ ...prev, showLegend: !prev.showLegend }))}
                style={{ margin: 2 }}
                compact
              >
                Legend
              </Chip>
              <Chip
                selected={chartPreferences.showGrid}
                onPress={() => setChartPreferences(prev => ({ ...prev, showGrid: !prev.showGrid }))}
                style={{ margin: 2 }}
                compact
              >
                Grid
              </Chip>
              <Chip
                selected={chartPreferences.showLabels}
                onPress={() => setChartPreferences(prev => ({ ...prev, showLabels: !prev.showLabels }))}
                style={{ margin: 2 }}
                compact
              >
                Labels
              </Chip>
            </View>
            
            {/* Auto Refresh Settings */}
            <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Auto Refresh</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Chip
                selected={chartPreferences.autoRefresh}
                onPress={() => setChartPreferences(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
                style={{ marginRight: 8 }}
                compact
              >
                Auto Refresh
              </Chip>
              {chartPreferences.autoRefresh && (
                <SegmentedButtons
                  value={chartPreferences.refreshInterval.toString()}
                  onValueChange={(value) => setChartPreferences(prev => ({ ...prev, refreshInterval: parseInt(value) }))}
                  buttons={[
                    { value: '15', label: '15s' },
                    { value: '30', label: '30s' },
                    { value: '60', label: '1m' },
                    { value: '300', label: '5m' },
                  ]}
                />
              )}
            </View>
            
            {/* Social Media Preferences */}
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>Social Media Preferences</Text>
            
            {/* Enabled Platforms */}
            <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Enabled Platforms</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
              {SOCIAL_PLATFORMS.filter(p => p.id !== 'copy').map(platform => (
                <Chip
                  key={platform.id}
                  selected={socialPreferences.enabledPlatforms.includes(platform.id)}
                  onPress={() => {
                    const newPlatforms = socialPreferences.enabledPlatforms.includes(platform.id)
                      ? socialPreferences.enabledPlatforms.filter(p => p !== platform.id)
                      : [...socialPreferences.enabledPlatforms, platform.id];
                    setSocialPreferences(prev => ({ ...prev, enabledPlatforms: newPlatforms }));
                  }}
                  style={{ margin: 2 }}
                  compact
                >
                  {platform.name}
                </Chip>
              ))}
            </View>
            
            {/* Default Platform */}
            <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Default Platform</Text>
            <SegmentedButtons
              value={socialPreferences.defaultPlatform}
              onValueChange={(value) => setSocialPreferences(prev => ({ ...prev, defaultPlatform: value }))}
              buttons={socialPreferences.enabledPlatforms.map(platformId => {
                const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
                return {
                  value: platformId,
                  label: platform?.name || platformId
                };
              })}
              style={{ marginBottom: 16 }}
            />
            
            {/* Sharing Options */}
            <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Sharing Options</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
              <Chip
                selected={socialPreferences.includeHashtags}
                onPress={() => setSocialPreferences(prev => ({ ...prev, includeHashtags: !prev.includeHashtags }))}
                style={{ margin: 2 }}
                compact
              >
                Include Hashtags
              </Chip>
              <Chip
                selected={socialPreferences.includeAppBranding}
                onPress={() => setSocialPreferences(prev => ({ ...prev, includeAppBranding: !prev.includeAppBranding }))}
                style={{ margin: 2 }}
                compact
              >
                Include App Branding
              </Chip>
              <Chip
                selected={socialPreferences.shareAnalytics}
                onPress={() => setSocialPreferences(prev => ({ ...prev, shareAnalytics: !prev.shareAnalytics }))}
                style={{ margin: 2 }}
                compact
              >
                Share Analytics
              </Chip>
              <Chip
                selected={socialPreferences.autoShare}
                onPress={() => setSocialPreferences(prev => ({ ...prev, autoShare: !prev.autoShare }))}
                style={{ margin: 2 }}
                compact
              >
                Auto Share
              </Chip>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button
                mode="outlined"
                onPress={() => setShowProfileForm(false)}
                style={{ flex: 1 }}
                disabled={profileLoading}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleProfileUpdate}
                style={{ flex: 1 }}
                loading={profileLoading}
                disabled={profileLoading}
              >
                Save Profile
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <SimpleLogo size="medium" showText={true} />
      </View>
      
      <Text variant="headlineMedium">Profile</Text>
      
      {/* Profile Completion */}
      {profileCompletion.percentage > 0 && (
        <Card>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text variant="titleMedium">Profile Completion</Text>
              <Text variant="bodyMedium">{profileCompletion.percentage}%</Text>
            </View>
            <ProgressBar progress={profileCompletion.percentage / 100} style={{ marginBottom: 8 }} />
            {profileCompletion.missingFields.length > 0 && (
              <Text variant="bodySmall" style={{ color: '#666' }}>
                Missing: {profileCompletion.missingFields.join(', ')}
              </Text>
            )}
          </Card.Content>
        </Card>
      )}
      
      {/* Current Profile Summary */}
      {currentProfile && (
        <Card>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12 }}>Current Profile</Text>
            <View style={{ gap: 8 }}>
              {currentProfile.bio && (
                <View>
                  <Text variant="labelMedium">Bio:</Text>
                  <Text variant="bodyMedium">{currentProfile.bio}</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="labelMedium">Experience:</Text>
                <Text variant="bodyMedium" style={{ textTransform: 'capitalize' }}>{currentProfile.investment_experience}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="labelMedium">Risk Tolerance:</Text>
                <Text variant="bodyMedium" style={{ textTransform: 'capitalize' }}>{currentProfile.risk_tolerance}</Text>
              </View>
              {currentProfile.preferred_sectors && currentProfile.preferred_sectors.length > 0 && (
                <View>
                  <Text variant="labelMedium">Preferred Sectors:</Text>
                  <Text variant="bodyMedium">{currentProfile.preferred_sectors.join(', ')}</Text>
                </View>
              )}
              {currentProfile.investment_goals && currentProfile.investment_goals.length > 0 && (
                <View>
                  <Text variant="labelMedium">Investment Goals:</Text>
                  <Text variant="bodyMedium">{currentProfile.investment_goals.join(', ')}</Text>
                </View>
              )}
              {currentProfile.portfolio_size_range && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="labelMedium">Portfolio Size:</Text>
                  <Text variant="bodyMedium">{currentProfile.portfolio_size_range}</Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      )}
      
      {/* Chart Preferences Summary */}
      <Card>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>Chart Preferences</Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="labelMedium">Default Design:</Text>
              <Text variant="bodyMedium" style={{ textTransform: 'capitalize' }}>
                {CHART_DESIGNS.find(d => d.id === chartPreferences.defaultDesign)?.name || 'Professional'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="labelMedium">Default Type:</Text>
              <Text variant="bodyMedium" style={{ textTransform: 'capitalize' }}>
                {chartPreferences.defaultType}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="labelMedium">Display Options:</Text>
              <Text variant="bodyMedium">
                {[
                  chartPreferences.showLegend && 'Legend',
                  chartPreferences.showGrid && 'Grid',
                  chartPreferences.showLabels && 'Labels'
                ].filter(Boolean).join(', ') || 'None'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="labelMedium">Auto Refresh:</Text>
              <Text variant="bodyMedium">
                {chartPreferences.autoRefresh ? `Every ${chartPreferences.refreshInterval}s` : 'Disabled'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      {/* Social Media Preferences Summary */}
      <Card>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>Social Media Preferences</Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="labelMedium">Enabled Platforms:</Text>
              <Text variant="bodyMedium">
                {socialPreferences.enabledPlatforms.length} platforms
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="labelMedium">Default Platform:</Text>
              <Text variant="bodyMedium" style={{ textTransform: 'capitalize' }}>
                {SOCIAL_PLATFORMS.find(p => p.id === socialPreferences.defaultPlatform)?.name || 'Twitter'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="labelMedium">Sharing Options:</Text>
              <Text variant="bodyMedium">
                {[
                  socialPreferences.includeHashtags && 'Hashtags',
                  socialPreferences.includeAppBranding && 'Branding',
                  socialPreferences.shareAnalytics && 'Analytics',
                  socialPreferences.autoShare && 'Auto Share'
                ].filter(Boolean).join(', ') || 'None'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button
          mode="contained"
          onPress={() => setShowProfileForm(true)}
          style={{ flex: 1 }}
          icon="account-edit"
        >
          {currentProfile ? 'Edit Profile' : 'Create Profile'}
        </Button>
        <Button
          mode="outlined"
          onPress={() => supabase.auth.signOut()}
          style={{ flex: 1 }}
          icon="logout"
        >
          Sign Out
        </Button>
      </View>
      
      {/* Saved Articles */}
      <Text variant="titleMedium" style={{ marginTop: 12 }}>Saved Articles</Text>
      <FlashList
        data={saved}
        keyExtractor={(a) => a.id}
        ListEmptyComponent={!loading ? <Text variant="labelSmall">No saved articles.</Text> : null}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8 }}>
            <Card.Content>
              <Text variant="bodyLarge" onPress={() => router.push(`/article/${item.id}`)} style={{ marginBottom: 8 }}>
                {item.headline}
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button mode="text" onPress={() => router.push(`/article/${item.id}`)} compact>
                  Open
                </Button>
                <Button
                  mode="text"
                  onPress={async () => {
                    if (!session?.user?.id) return;
                    await removeSavedArticle(session.user.id, item.id);
                    const articles = await fetchSavedArticles(session.user.id);
                    setSaved(articles);
                  }}
                  compact
                >
                  Remove
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}


