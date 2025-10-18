import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get request data
    const { method } = req
    const url = new URL(req.url)
    const pathname = url.pathname

    console.log(`📡 Render-Connect Edge Function called: ${method} ${pathname}`)

    // Handle different endpoints
    if (method === 'GET') {
      // Health check endpoint
      return new Response(
        JSON.stringify({
          status: 'healthy',
          service: 'render-connect',
          timestamp: new Date().toISOString(),
          endpoints: {
            health: 'GET /',
            sync: 'POST /sync',
            status: 'GET /status'
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (method === 'POST') {
      const body = await req.json()
      
      // Handle sync request
      if (pathname.includes('/sync') || body.type === 'sync') {
        const syncData = {
          timestamp: new Date().toISOString(),
          renderServices: {
            mainApp: 'https://jamstockanalytics-production.onrender.com',
            webhook: 'https://jamstockanalytics-webhook.onrender.com'
          },
          environment: body.environment || 'production',
          status: body.status || 'active'
        }

        // Store sync data in Supabase database
        const { data, error } = await supabaseClient
          .from('render_sync_log')
          .insert([syncData])

        if (error) {
          console.error('❌ Database insert error:', error)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: error.message,
              timestamp: new Date().toISOString()
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          )
        }

        console.log('✅ Sync data stored successfully:', data)

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Render services synced successfully',
            data: syncData,
            timestamp: new Date().toISOString()
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }
    }

    // Default response for unrecognized requests
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Endpoint not found',
        availableEndpoints: {
          'GET /': 'Health check',
          'POST /sync': 'Sync Render.com services',
          'GET /status': 'Get service status'
        },
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      }
    )

  } catch (error) {
    console.error('❌ Edge Function error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
