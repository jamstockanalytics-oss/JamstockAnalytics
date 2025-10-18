const { supabaseAdmin } = require('./client');

/**
 * Connect to Supabase Edge Function for Render.com integration
 */
class SupabaseRenderConnect {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL || 'https://ojatfvokildmngpzdutf.supabase.co';
    this.anonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';
    this.functionUrl = `${this.supabaseUrl}/functions/v1/render-connect`;
  }

  /**
   * Test connection to Supabase Edge Function
   */
  async testConnection() {
    try {
      const response = await fetch(this.functionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Supabase Edge Function connection successful:', data);
        return { success: true, data };
      } else {
        console.error('❌ Supabase Edge Function connection failed:', response.status, response.statusText);
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      console.error('❌ Supabase Edge Function connection error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send data to Supabase Edge Function
   */
  async sendData(payload) {
    try {
      const response = await fetch(this.functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Data sent to Supabase Edge Function successfully:', data);
        return { success: true, data };
      } else {
        console.error('❌ Failed to send data to Supabase Edge Function:', response.status, response.statusText);
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      console.error('❌ Error sending data to Supabase Edge Function:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Render.com service status and send to Supabase
   */
  async syncRenderStatus() {
    const renderServices = {
      mainApp: 'https://jamstockanalytics-production.onrender.com',
      webhook: 'https://jamstockanalytics-webhook.onrender.com'
    };

    const statusData = {
      timestamp: new Date().toISOString(),
      services: renderServices,
      environment: process.env.NODE_ENV || 'production'
    };

    return await this.sendData(statusData);
  }
}

module.exports = SupabaseRenderConnect;
