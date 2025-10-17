/**
 * Multi-Authentication System
 * Supports multiple authentication methods without user input
 */

import { createClient } from '@supabase/supabase-js';

export interface AuthConfig {
  supabaseUrl: string;
  supabaseKey: string;
  authMethod?: 'password' | 'service_account' | 'api_key' | 'jwt_token' | 'oauth2_client';
  credentials?: {
    email?: string;
    password?: string;
    serviceRoleKey?: string;
    apiKey?: string;
    jwtSecret?: string;
    oauth2ClientId?: string;
    oauth2ClientSecret?: string;
  };
}

export class MultiAuth {
  private supabase: any;
  private config: AuthConfig;
  private session: any = null;

  constructor(config: AuthConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  /**
   * Authenticate using configured method
   */
  async authenticate(): Promise<any> {
    switch (this.config.authMethod) {
      case 'service_account':
        return await this.authenticateServiceAccount();
      case 'api_key':
        return await this.authenticateApiKey();
      case 'jwt_token':
        return await this.authenticateJWT();
      case 'oauth2_client':
        return await this.authenticateOAuth2();
      default:
        return await this.authenticatePassword();
    }
  }

  /**
   * Service Account Authentication
   * Uses service role key for admin operations
   */
  private async authenticateServiceAccount(): Promise<any> {
    try {
      if (!this.config.credentials?.serviceRoleKey) {
        throw new Error('Service role key not provided');
      }

      // Create client with service role key
      const serviceSupabase = createClient(
        this.config.supabaseUrl,
        this.config.credentials.serviceRoleKey
      );

      // Service accounts don't need explicit authentication
      // They have admin privileges by default
      this.session = {
        user: { id: 'service-account', role: 'service_role' },
        access_token: this.config.credentials.serviceRoleKey
      };

      return this.session;
    } catch (error) {
      console.error('Service account authentication failed:', error);
      throw error;
    }
  }

  /**
   * API Key Authentication
   * Uses API keys for authentication
   */
  private async authenticateApiKey(): Promise<any> {
    try {
      if (!this.config.credentials?.apiKey) {
        throw new Error('API key not provided');
      }

      // API key authentication
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: 'api-user@system',
        password: this.config.credentials.apiKey
      });

      if (error) throw error;
      this.session = data.session;
      return this.session;
    } catch (error) {
      console.error('API key authentication failed:', error);
      throw error;
    }
  }

  /**
   * JWT Token Authentication
   * Uses JWT tokens for authentication
   */
  private async authenticateJWT(): Promise<any> {
    try {
      if (!this.config.credentials?.jwtSecret) {
        throw new Error('JWT secret not provided');
      }

      // Create JWT token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { 
          sub: 'system-user',
          role: 'authenticated',
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
        },
        this.config.credentials.jwtSecret
      );

      this.session = {
        user: { id: 'jwt-user', role: 'authenticated' },
        access_token: token
      };

      return this.session;
    } catch (error) {
      console.error('JWT authentication failed:', error);
      throw error;
    }
  }

  /**
   * OAuth2 Client Credentials Flow
   * Uses OAuth2 client credentials for authentication
   */
  private async authenticateOAuth2(): Promise<any> {
    try {
      if (!this.config.credentials?.oauth2ClientId || !this.config.credentials?.oauth2ClientSecret) {
        throw new Error('OAuth2 client credentials not provided');
      }

      // OAuth2 client credentials flow
      const tokenResponse = await fetch('https://your-auth-provider.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.credentials.oauth2ClientId,
          client_secret: this.config.credentials.oauth2ClientSecret,
          scope: 'read write'
        })
      });

      const tokenData = await tokenResponse.json();
      
      this.session = {
        user: { id: 'oauth2-user', role: 'authenticated' },
        access_token: tokenData.access_token
      };

      return this.session;
    } catch (error) {
      console.error('OAuth2 authentication failed:', error);
      throw error;
    }
  }

  /**
   * Password Authentication (fallback)
   * Uses email/password for authentication
   */
  private async authenticatePassword(): Promise<any> {
    try {
      if (!this.config.credentials?.email || !this.config.credentials?.password) {
        throw new Error('Email and password not provided');
      }

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: this.config.credentials.email,
        password: this.config.credentials.password
      });

      if (error) throw error;
      this.session = data.session;
      return this.session;
    } catch (error) {
      console.error('Password authentication failed:', error);
      throw error;
    }
  }

  /**
   * Get current session
   */
  getSession(): any {
    return this.session;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.session !== null;
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await this.supabase.auth.signOut();
      this.session = null;
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<any> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();
      if (error) throw error;
      this.session = data.session;
      return this.session;
    } catch (error) {
      console.error('Session refresh failed:', error);
      throw error;
    }
  }
}

/**
 * Factory function to create MultiAuth instance
 */
export function createMultiAuth(config: AuthConfig): MultiAuth {
  return new MultiAuth(config);
}

/**
 * Pre-configured authentication methods
 */
export const AuthMethods = {
  SERVICE_ACCOUNT: (supabaseUrl: string, serviceRoleKey: string) => ({
    supabaseUrl,
    supabaseKey: serviceRoleKey,
    authMethod: 'service_account' as const,
    credentials: { serviceRoleKey }
  }),

  API_KEY: (supabaseUrl: string, supabaseKey: string, apiKey: string) => ({
    supabaseUrl,
    supabaseKey,
    authMethod: 'api_key' as const,
    credentials: { apiKey }
  }),

  JWT_TOKEN: (supabaseUrl: string, supabaseKey: string, jwtSecret: string) => ({
    supabaseUrl,
    supabaseKey,
    authMethod: 'jwt_token' as const,
    credentials: { jwtSecret }
  }),

  OAUTH2_CLIENT: (supabaseUrl: string, supabaseKey: string, clientId: string, clientSecret: string) => ({
    supabaseUrl,
    supabaseKey,
    authMethod: 'oauth2_client' as const,
    credentials: { oauth2ClientId: clientId, oauth2ClientSecret: clientSecret }
  })
};
