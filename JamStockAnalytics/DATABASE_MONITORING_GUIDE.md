# Database Monitoring Guide for JamStockAnalytics

This guide provides comprehensive information about monitoring your Supabase database for performance issues, idle transactions, and overall health.

## 🎯 Overview

The database monitoring system includes:
- **Idle Transaction Detection**: Identifies sessions stuck in "idle in transaction" state
- **Connection Health Monitoring**: Tracks database connection performance
- **Lock Analysis**: Detects database lock contention
- **Performance Metrics**: Monitors query response times and table statistics
- **Automated Cleanup**: Optional automatic cleanup of problematic sessions

## 🚀 Quick Start

### Basic Monitoring
```bash
# Run basic database health check
npm run db:health-check

# Run comprehensive monitoring
npm run db:monitor

# Get detailed verbose output
npm run db:monitor:verbose

# Get JSON output for programmatic use
npm run db:monitor:json
```

### Advanced Monitoring
```bash
# Dry run - see what would be cleaned up without doing it
npm run db:monitor:dry-run

# Auto cleanup (use with caution - requires superuser privileges)
npm run db:monitor --cleanup
```

## 📊 Monitoring Components

### 1. Idle Transaction Detection

The system monitors for PostgreSQL sessions that are stuck in "idle in transaction" state for more than 15 minutes. This is a common cause of database performance issues.

**What it checks:**
- Sessions in `idle in transaction` state
- Duration of idle time (threshold: 15 minutes)
- Number of locks held by each session
- Blocking relationships between sessions
- Current query being executed

**Your original query enhanced:**
```sql
-- Enhanced version with better error handling and reporting
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
```

### 2. Connection Health Monitoring

**Metrics tracked:**
- Connection response time
- Connection pool status
- Authentication health
- Network latency

**Thresholds:**
- **Healthy**: < 1000ms response time
- **Warning**: 1000-5000ms response time
- **Critical**: > 5000ms response time

### 3. Performance Metrics

**Database statistics monitored:**
- Total articles count
- Total users count
- Average query response time
- Table growth rates
- Index usage statistics

### 4. Lock Analysis

**Lock types monitored:**
- Row-level locks
- Table locks
- Deadlock detection
- Lock wait times

## 🛠️ Configuration

### Environment Variables

Ensure these are set in your `.env` file:
```bash
# Required for monitoring
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Custom thresholds
DB_IDLE_THRESHOLD_MINUTES=15
DB_SLOW_QUERY_THRESHOLD_MS=1000
DB_CRITICAL_QUERY_THRESHOLD_MS=5000
```

### Monitoring Thresholds

You can customize monitoring thresholds by modifying the constants in:
- `scripts/database-monitoring.js` (Node.js script)
- `lib/services/database-health.ts` (TypeScript service)

## 📈 Understanding Results

### Health Status Levels

- **✅ Healthy**: All systems operating normally
- **⚠️ Warning**: Performance degradation detected, monitoring recommended
- **❌ Critical**: Serious issues requiring immediate attention

### Sample Output

```
🔍 Starting Database Monitoring...

✅ Database connection successful
📊 Total articles in database: 1,247

🔍 Checking for idle in transaction sessions...
📋 Found 0 idle in transaction sessions

🔍 Checking active connections...
✅ Connection pool is responsive

🔍 Checking database locks...
📊 Query response time: 234ms (normal)

🔍 Checking performance metrics...
📊 Articles: 1,247
📊 Users: 89

📊 MONITORING RESULTS
==================================================
✅ IDLE TRANSACTIONS: No long-running idle sessions
✅ CONNECTIONS: healthy - Connection pool responsive
✅ LOCKS: normal (234ms)
✅ PERFORMANCE: healthy
   Articles: 1,247, Users: 89

==================================================
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "Connection test failed"
**Cause**: Invalid Supabase credentials or network issues
**Solution**: 
- Verify environment variables
- Check network connectivity
- Ensure Supabase project is active

#### 2. "Limited monitoring capability"
**Cause**: Insufficient privileges to query system tables
**Solution**:
- Use service role key for admin operations
- Create custom PostgreSQL functions with elevated privileges
- Contact Supabase support for additional monitoring access

#### 3. High idle transaction count
**Cause**: Application code leaving transactions open
**Solution**:
- Review transaction handling in application code
- Implement proper transaction cleanup
- Use connection pooling effectively

### Manual Session Termination

If you need to manually terminate problematic sessions:

```sql
-- List all idle in transaction sessions
SELECT pid, usename, state_change, query 
FROM pg_stat_activity 
WHERE state = 'idle in transaction' 
AND now() - state_change > interval '15 minutes';

-- Terminate a specific session (use with caution)
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE pid = 'YOUR_PID_HERE';
```

## 🔧 Integration with Application

### Using the Health Service in Your App

```typescript
import { DatabaseHealthService } from './lib/services/database-health';

// Get formatted health report
const healthReport = await DatabaseHealthService.getHealthCheckReport();
console.log(healthReport);

// Get JSON data for custom processing
const healthData = await DatabaseHealthService.performHealthCheck();
if (healthData.status === 'critical') {
  // Send alert, log error, etc.
  console.error('Database health critical:', healthData);
}

// Check specific components
const connectionCheck = await DatabaseHealthService.checkConnection();
const idleCheck = await DatabaseHealthService.checkIdleTransactions();
```

### Automated Monitoring

Set up automated monitoring with cron jobs:

```bash
# Add to crontab for hourly monitoring
0 * * * * cd /path/to/JamStockAnalytics && npm run db:monitor >> /var/log/db-monitor.log 2>&1

# Daily health check with alerts
0 9 * * * cd /path/to/JamStockAnalytics && npm run db:health-check:json | jq -r '.status' | grep -q critical && echo "DB Critical Alert" | mail -s "Database Alert" admin@yourdomain.com
```

## 📋 Best Practices

### 1. Regular Monitoring
- Run health checks at least daily
- Monitor during peak usage hours
- Set up alerts for critical issues

### 2. Transaction Management
- Always commit or rollback transactions
- Use connection pooling
- Implement timeout mechanisms
- Monitor transaction duration

### 3. Performance Optimization
- Monitor slow queries
- Optimize database indexes
- Use prepared statements
- Implement query caching

### 4. Security
- Use least-privilege access
- Rotate service keys regularly
- Monitor for unusual activity
- Keep monitoring logs secure

## 🔍 Advanced Monitoring

### Custom Metrics

You can extend the monitoring system by adding custom checks:

```typescript
// Add to DatabaseHealthService
static async checkCustomMetric(): Promise<CustomCheck> {
  // Your custom monitoring logic
  const result = await supabase
    .from('your_table')
    .select('count', { count: 'exact', head: true });
  
  return {
    status: result.error ? 'critical' : 'healthy',
    count: result.data?.length || 0,
    error: result.error?.message
  };
}
```

### Integration with External Monitoring

The system outputs JSON data that can be integrated with:
- **Grafana**: For visual dashboards
- **Prometheus**: For metrics collection
- **DataDog**: For comprehensive monitoring
- **New Relic**: For application performance monitoring

## 📚 Additional Resources

- [PostgreSQL pg_stat_activity Documentation](https://www.postgresql.org/docs/current/monitoring-stats.html)
- [Supabase Database Monitoring](https://supabase.com/docs/guides/database/monitoring)
- [PostgreSQL Lock Monitoring](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Database Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)

---

**Note**: This monitoring system is designed for Supabase/PostgreSQL databases. For other database systems, adapt the queries and connection logic accordingly.
