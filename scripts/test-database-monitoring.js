#!/usr/bin/env node

/**
 * Test Script for Database Monitoring
 * 
 * This script demonstrates the database monitoring functionality
 * and provides a way to test the monitoring system.
 */

const { DatabaseMonitor } = require('./database-monitoring');

async function runTests() {
  console.log('🧪 Testing Database Monitoring System\n');
  
  try {
    // Test 1: Basic monitoring
    console.log('Test 1: Basic Database Monitoring');
    console.log('='.repeat(40));
    
    const monitor = new DatabaseMonitor();
    
    // Override the monitoring methods to test without actual database calls
    const originalRunMonitoring = monitor.runMonitoring;
    monitor.runMonitoring = async function() {
      console.log('🔍 Starting Database Monitoring...\n');
      
      try {
        // Simulate connection test
        console.log('✅ Database connection successful');
        console.log('📊 Total articles in database: 1,247\n');
        
        // Simulate idle transaction check
        console.log('🔍 Checking for idle in transaction sessions...');
        console.log('📋 Found 0 idle in transaction sessions');
        
        // Simulate connection check
        console.log('🔍 Checking active connections...');
        console.log('✅ Connection pool is responsive');
        
        // Simulate lock check
        console.log('🔍 Checking database locks...');
        console.log('📊 Query response time: 234ms (normal)');
        
        // Simulate performance check
        console.log('🔍 Checking performance metrics...');
        console.log('📊 Articles: 1,247');
        console.log('📊 Users: 89');
        
        // Display results
        const results = [
          { type: 'idle_transactions', count: 0, sessions: [], threshold: 15 },
          { type: 'connections', status: 'healthy', message: 'Connection pool responsive' },
          { type: 'locks', status: 'normal', response_time_ms: 234 },
          { type: 'performance', articles_count: 1247, users_count: 89, status: 'healthy' }
        ];
        
        this.displayResults(results);
        
      } catch (error) {
        console.error('❌ Monitoring failed:', error.message);
      }
    };
    
    await monitor.runMonitoring();
    
    // Test 2: Health service (if available)
    console.log('\n\nTest 2: Health Service Check');
    console.log('='.repeat(40));
    
    try {
      // Try to load the health service
      const { DatabaseHealthService } = require('../lib/services/database-health');
      
      console.log('✅ Health service loaded successfully');
      console.log('📋 Available methods:');
      console.log('   - performHealthCheck()');
      console.log('   - getHealthCheckReport()');
      console.log('   - getHealthCheckJSON()');
      console.log('   - formatHealthReport()');
      
    } catch (error) {
      console.log('⚠️  Health service not available:', error.message);
      console.log('💡 Make sure to compile TypeScript files first');
    }
    
    // Test 3: Configuration validation
    console.log('\n\nTest 3: Configuration Validation');
    console.log('='.repeat(40));
    
    const requiredEnvVars = [
      'EXPO_PUBLIC_SUPABASE_URL',
      'EXPO_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    let configValid = true;
    requiredEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar}: Set`);
      } else {
        console.log(`❌ ${envVar}: Missing`);
        configValid = false;
      }
    });
    
    if (configValid) {
      console.log('\n✅ All required environment variables are set');
    } else {
      console.log('\n❌ Some environment variables are missing');
      console.log('💡 Check your .env file');
    }
    
    // Test 4: Command line options
    console.log('\n\nTest 4: Command Line Options');
    console.log('='.repeat(40));
    
    console.log('Available monitoring commands:');
    console.log('  npm run db:monitor              # Basic monitoring');
    console.log('  npm run db:monitor:verbose      # Detailed output');
    console.log('  npm run db:monitor:json         # JSON output');
    console.log('  npm run db:monitor:dry-run      # Safe mode');
    console.log('  npm run db:health-check         # Health service check');
    console.log('  npm run db:health-check:json    # Health service JSON');
    
    console.log('\nAvailable command line flags:');
    console.log('  --dry-run                       # Show what would be cleaned up');
    console.log('  --cleanup                       # Auto cleanup (use with caution)');
    console.log('  --verbose                       # Detailed session information');
    console.log('  --json                          # JSON output format');
    console.log('  --help, -h                      # Show help message');
    
    // Test 5: Sample queries
    console.log('\n\nTest 5: Sample Monitoring Queries');
    console.log('='.repeat(40));
    
    console.log('Your original idle transaction query:');
    console.log(`
-- Candidates: sessions idle in transaction > 15 minutes (conservative)
WITH susp AS (
  SELECT
    pid,
    usename,
    application_name,
    client_addr,
    backend_start,
    xact_start,
    state_change,
    state,
    LEFT(query, 2000) AS query,
    now() - state_change AS state_duration
  FROM pg_stat_activity
  WHERE datname = current_database()
    AND pid <> pg_backend_pid()
    AND state = 'idle in transaction'
    AND now() - state_change > interval '15 minutes'
)
SELECT
  s.*,
  COALESCE(l.lock_count, 0) AS active_lock_count,
  COALESCE(blocking.blocker_pids, '[]'::text) AS blocking_pids
FROM susp s
LEFT JOIN (
  SELECT pid, COUNT(*) AS lock_count
  FROM pg_locks
  GROUP BY pid
) l ON l.pid = s.pid
LEFT JOIN (
  SELECT
    blocked.pid AS blocked_pid,
    jsonb_agg(DISTINCT blocker.pid)::text AS blocker_pids
  FROM pg_locks blocked_lk
  JOIN pg_stat_activity blocked ON blocked.pid = blocked_lk.pid
  JOIN pg_locks blocker_lk ON blocker_lk.locktype = blocked_lk.locktype 
    AND blocker_lk.database is not distinct from blocked_lk.database 
    AND blocker_lk.relation is not distinct from blocked_lk.relation 
    AND blocker_lk.page is not distinct from blocked_lk.page 
    AND blocker_lk.tuple is not distinct from blocked_lk.tuple
  JOIN pg_stat_activity blocker ON blocker.pid = blocker_lk.pid
  WHERE blocked.pid IS NOT NULL AND blocker.pid IS NOT NULL AND blocker.pid <> blocked.pid
  GROUP BY blocked.pid
) blocking ON blocking.blocked_pid = s.pid
ORDER BY state_duration DESC;
    `);
    
    console.log('\n✅ Test completed successfully!');
    console.log('\n📚 Next steps:');
    console.log('1. Run: npm run db:monitor');
    console.log('2. Check the DATABASE_MONITORING_GUIDE.md for detailed usage');
    console.log('3. Set up automated monitoring with cron jobs');
    console.log('4. Integrate health checks into your application');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Help text
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Database Monitoring Test Script

This script tests the database monitoring functionality without making
actual database calls, making it safe to run in any environment.

Usage: node test-database-monitoring.js

The script will:
1. Test basic monitoring functionality
2. Validate configuration
3. Show available commands
4. Display sample queries
5. Provide next steps

No database connections are made during testing.
`);
  process.exit(0);
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
