import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface UserProfileData {
  bio?: string;
  profile_image_url?: string;
  investment_experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  risk_tolerance?: 'conservative' | 'moderate' | 'aggressive';
  preferred_sectors?: string[];
  investment_goals?: string[];
  portfolio_size_range?: string;
}

interface UpsertUserProfileResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing authorization header'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Extract token from Bearer header
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid or expired token'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const requestBody: UserProfileData = await req.json()

    // Validate required fields
    if (!requestBody || typeof requestBody !== 'object') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request body'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate investment_experience if provided
    if (requestBody.investment_experience && 
        !['beginner', 'intermediate', 'advanced', 'expert'].includes(requestBody.investment_experience)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid investment_experience value. Must be: beginner, intermediate, advanced, or expert'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate risk_tolerance if provided
    if (requestBody.risk_tolerance && 
        !['conservative', 'moderate', 'aggressive'].includes(requestBody.risk_tolerance)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid risk_tolerance value. Must be: conservative, moderate, or aggressive'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Prepare data for database function
    const profileData = {
      user_id: user.id,
      bio: requestBody.bio || null,
      profile_image_url: requestBody.profile_image_url || null,
      investment_experience: requestBody.investment_experience || 'beginner',
      risk_tolerance: requestBody.risk_tolerance || 'moderate',
      preferred_sectors: requestBody.preferred_sectors || [],
      investment_goals: requestBody.investment_goals || [],
      portfolio_size_range: requestBody.portfolio_size_range || null
    }

    // Call the database function
    const { data, error } = await supabaseClient.rpc('upsert_user_profile', {
      p_user_id: profileData.user_id,
      p_bio: profileData.bio,
      p_profile_image_url: profileData.profile_image_url,
      p_investment_experience: profileData.investment_experience,
      p_risk_tolerance: profileData.risk_tolerance,
      p_preferred_sectors: profileData.preferred_sectors,
      p_investment_goals: profileData.investment_goals,
      p_portfolio_size_range: profileData.portfolio_size_range
    })

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Database operation failed',
          details: error.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Return success response
    const response: UpsertUserProfileResponse = {
      success: true,
      data: data,
      message: 'User profile updated successfully'
    }

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
