# JamStockAnalytics Chat Server

A Deno-based API server for managing chat messages in the JamStockAnalytics application.

## Features

- ✅ **Rate Limiting**: Sliding window rate limiting per IP
- ✅ **Security**: Admin secret authentication for destructive operations
- ✅ **CORS Support**: Cross-origin resource sharing enabled
- ✅ **Input Validation**: Proper validation of all inputs
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Health Checks**: Built-in health check endpoint
- ✅ **Database Integration**: Supabase integration with proper error handling
- ✅ **Cleanup Operations**: Admin endpoint for cleaning old messages

## Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit with your Supabase credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. Install Deno

```bash
# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh

# Windows (PowerShell)
irm https://deno.land/install.ps1 | iex
```

### 3. Run Server

```bash
# Development mode with auto-reload
deno task dev

# Production mode
deno task start

# Build executable
deno task build
```

## API Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "rateLimit": "active"
  }
}
```

### Get Messages
```http
GET /messages?limit=50&user_id=uuid&session_id=uuid
```

**Query Parameters:**
- `limit` (optional): Number of messages to return (1-100, default: 50)
- `user_id` (optional): Filter by user ID (UUID format)
- `session_id` (optional): Filter by session ID (UUID format)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "session_id": "uuid",
      "message_type": "user|ai|system",
      "content": "message content",
      "context_data": {},
      "created_at": "2024-01-15T10:30:00Z",
      "is_analysis_context": false,
      "tokens_used": 150,
      "response_time_ms": 1200
    }
  ],
  "meta": {
    "count": 25,
    "limit": 50,
    "rateLimit": {
      "remaining": 95,
      "resetTime": 1642248600000
    }
  }
}
```

### Admin Clear Messages
```http
POST /admin/clear
Headers:
  x-admin-secret: your_admin_secret_here
```

**Response:**
```json
{
  "success": true,
  "deletedCount": 1250,
  "cutoffDate": "2023-12-16T10:30:00Z"
}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Required |
| `PORT` | Server port | 8000 |
| `RATE_LIMIT` | Requests per window | 100 |
| `WINDOW_MS` | Rate limit window (ms) | 60000 |
| `MAX_MESSAGES` | Max messages per request | 100 |
| `CLEANUP_DAYS` | Days to keep messages | 30 |

### Rate Limiting

The server implements a sliding window rate limiter:
- **Window**: 1 minute (configurable)
- **Limit**: 100 requests per window (configurable)
- **Storage**: In-memory with periodic cleanup
- **Headers**: Rate limit info included in responses

## Security

### Admin Authentication
- Admin operations require `x-admin-secret` header
- Secret is generated at startup and logged to console
- Failed admin attempts are logged with IP address

### Input Validation
- User IDs must be valid UUIDs
- Limits are bounded (1-100 messages)
- SQL injection protection via Supabase client

### CORS
- All origins allowed (`*`)
- Preflight requests handled automatically
- Configurable headers and methods

## Deployment

### Deno Deploy

```bash
# Install Deno Deploy CLI
deno install --allow-read --allow-write --allow-env --allow-net --allow-run --no-check -r -f https://deno.land/x/deploy/deployctl.ts

# Deploy
deployctl deploy --project=your-project server.ts
```

### Docker

```dockerfile
FROM denoland/deno:1.40.0

WORKDIR /app
COPY server.ts .
COPY deno.json .

EXPOSE 8000

CMD ["deno", "task", "start"]
```

### VPS/Cloud

```bash
# Build executable
deno task build

# Run on server
./server
```

## Monitoring

### Health Checks
- Database connectivity
- Rate limiter status
- Service version info

### Logging
- Request/response logging
- Error logging with stack traces
- Admin action logging
- Rate limit violations

### Metrics
- Request count per endpoint
- Rate limit hits
- Database query performance
- Memory usage

## Development

### Code Quality
```bash
# Format code
deno task fmt

# Lint code
deno task lint

# Run tests
deno task test
```

### Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test messages endpoint
curl "http://localhost:8000/messages?limit=10"

# Test admin clear (replace SECRET with actual secret)
curl -X POST http://localhost:8000/admin/clear \
  -H "x-admin-secret: SECRET"
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
   - Verify Supabase project is active
   - Check network connectivity

2. **Rate Limit Exceeded**
   - Wait for rate limit window to reset
   - Check rate limit configuration
   - Monitor for abuse

3. **Admin Operations Failing**
   - Verify admin secret from server logs
   - Check x-admin-secret header
   - Ensure proper permissions

### Debug Mode

```bash
# Run with debug logging
DEBUG=1 deno task dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run `deno task fmt` and `deno task lint`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
