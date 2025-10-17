import { createClient } from "npm:@supabase/supabase-js@2.36.0";
import { randomBytes } from "node:crypto";

// Configuration
const CONFIG = {
  RATE_LIMIT: 100, // requests per window
  WINDOW_MS: 60_000, // 1 minute
  MAX_MESSAGES: 100, // max messages per request
  CLEANUP_DAYS: 30, // days to keep messages
  ADMIN_SECRET_LENGTH: 32,
} as const;

// Generate admin secret at startup
const ADMIN_SECRET = randomBytes(CONFIG.ADMIN_SECRET_LENGTH).toString('hex');
console.info('🔐 Admin secret generated');

// Enhanced rate limiter with sliding window
const rateLimitStore = new Map<string, { requests: number[]; lastCleanup: number }>();

function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  if (cfConnectingIP) return cfConnectingIP;
  
  try {
    const url = new URL(req.url);
    return url.hostname || 'unknown';
  } catch {
    return 'unknown';
  }
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - CONFIG.WINDOW_MS;
  
  let entry = rateLimitStore.get(ip);
  if (!entry) {
    entry = { requests: [], lastCleanup: now };
    rateLimitStore.set(ip, entry);
  }
  
  // Cleanup old requests
  entry.requests = entry.requests.filter(time => time > windowStart);
  
  // Check if limit exceeded
  const isAllowed = entry.requests.length < CONFIG.RATE_LIMIT;
  
  if (isAllowed) {
    entry.requests.push(now);
  }
  
  const resetTime = entry.requests.length > 0 ? entry.requests[0] + CONFIG.WINDOW_MS : now + CONFIG.WINDOW_MS;
  const remaining = Math.max(0, CONFIG.RATE_LIMIT - entry.requests.length);
  
  return { allowed: isAllowed, remaining, resetTime };
}

// Cleanup old rate limit entries periodically
setInterval(() => {
  const cutoff = Date.now() - (CONFIG.WINDOW_MS * 2);
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (entry.lastCleanup < cutoff) {
      rateLimitStore.delete(ip);
    }
  }
}, CONFIG.WINDOW_MS);

// Validate environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-secret',
  'Access-Control-Max-Age': '86400',
};

// Response helpers
function createResponse(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...headers,
    },
  });
}

function createErrorResponse(error: string, status = 400, details?: any) {
  return createResponse(
    { error, details, timestamp: new Date().toISOString() },
    status
  );
}

// Input validation
function validateLimit(limit: string | null): number {
  if (!limit) return 50;
  const parsed = parseInt(limit, 10);
  return Math.min(Math.max(parsed, 1), CONFIG.MAX_MESSAGES);
}

function validateUserId(userId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId);
}

// API Handlers
async function handleGetMessages(req: Request): Promise<Response> {
  try {
    const ip = getClientIP(req);
    const rateLimit = checkRateLimit(ip);
    
    if (!rateLimit.allowed) {
      return createErrorResponse('Rate limit exceeded', 429, {
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime,
      });
    }

    const url = new URL(req.url);
    const limit = validateLimit(url.searchParams.get('limit'));
    const userId = url.searchParams.get('user_id');
    const sessionId = url.searchParams.get('session_id');

    // Build query
    let query = supabase
      .from('chat_messages')
      .select(`
        id,
        user_id,
        session_id,
        message_type,
        content,
        context_data,
        created_at,
        is_analysis_context,
        tokens_used,
        response_time_ms
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by user if provided
    if (userId) {
      if (!validateUserId(userId)) {
        return createErrorResponse('Invalid user_id format');
      }
      query = query.eq('user_id', userId);
    }

    // Filter by session if provided
    if (sessionId) {
      if (!validateUserId(sessionId)) {
        return createErrorResponse('Invalid session_id format');
      }
      query = query.eq('session_id', sessionId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return createErrorResponse('Database error', 500, error.message);
    }

    return createResponse({
      data,
      meta: {
        count: data?.length || 0,
        limit,
        rateLimit: {
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime,
        },
      },
    });

  } catch (error) {
    console.error('Unexpected error in handleGetMessages:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

async function handleAdminClear(req: Request): Promise<Response> {
  try {
    const ip = getClientIP(req);
    const rateLimit = checkRateLimit(ip);
    
    if (!rateLimit.allowed) {
      return createErrorResponse('Rate limit exceeded', 429);
    }

    // Verify admin secret
    const providedSecret = req.headers.get('x-admin-secret');
    if (!providedSecret || providedSecret !== ADMIN_SECRET) {
      console.warn(`Unauthorized admin access attempt from ${ip}`);
      return createErrorResponse('Unauthorized', 401);
    }

    console.log(`🧹 Admin cleanup initiated by ${ip}`);

    // Delete messages older than specified days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CONFIG.CLEANUP_DAYS);

    const { error, count } = await supabase
      .from('chat_messages')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('Cleanup error:', error);
      return createErrorResponse('Cleanup failed', 500, error.message);
    }

    console.log(`✅ Cleaned up ${count} messages older than ${CONFIG.CLEANUP_DAYS} days`);
    
    return createResponse({
      success: true,
      deletedCount: count,
      cutoffDate: cutoffDate.toISOString(),
    });

  } catch (error) {
    console.error('Unexpected error in handleAdminClear:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

async function handleHealthCheck(): Promise<Response> {
  try {
    // Test database connection
    const { error } = await supabase
      .from('chat_messages')
      .select('id')
      .limit(1);

    if (error) {
      return createErrorResponse('Database connection failed', 503, error.message);
    }

    return createResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'connected',
        rateLimit: 'active',
      },
    });
  } catch (error) {
    return createErrorResponse('Health check failed', 503);
  }
}

// Main request handler
async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Route handlers
  switch (true) {
    case req.method === 'GET' && pathname === '/health':
      return await handleHealthCheck();
      
    case req.method === 'GET' && pathname === '/messages':
      return await handleGetMessages(req);
      
    case req.method === 'POST' && pathname === '/admin/clear':
      return await handleAdminClear(req);
      
    default:
      return createErrorResponse('Not found', 404);
  }
}

// Start server
console.log('🚀 Starting JamStockAnalytics Chat Server...');
console.log('📊 Configuration:', {
  rateLimit: CONFIG.RATE_LIMIT,
  windowMs: CONFIG.WINDOW_MS,
  maxMessages: CONFIG.MAX_MESSAGES,
  cleanupDays: CONFIG.CLEANUP_DAYS,
});

Deno.serve({
  port: 8000,
  onListen: ({ port, hostname }) => {
    console.log(`✅ Server running on ${hostname}:${port}`);
    console.log(`🔐 Admin secret: ${ADMIN_SECRET}`);
    console.log(`📋 Available endpoints:`);
    console.log(`  GET  /health - Health check`);
    console.log(`  GET  /messages?limit=50&user_id=uuid&session_id=uuid - Get messages`);
    console.log(`  POST /admin/clear - Clear old messages (requires x-admin-secret header)`);
  },
}, handleRequest);
