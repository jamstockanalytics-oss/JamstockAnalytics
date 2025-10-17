# DeepSeek Chat Integration Setup Guide

This guide will help you set up the complete DeepSeek database integration with API integration and chat implementation on Supabase for the JamStockAnalytics app.

## 🚀 Features Implemented

### ✅ Core Features
- **DeepSeek API Integration**: Full integration with DeepSeek's chat completion API
- **Database Persistence**: All chat sessions and messages stored in Supabase
- **Session Management**: Create, switch, and manage multiple chat sessions
- **Message History**: Persistent chat history with context awareness
- **Analytics**: Token usage tracking and response time monitoring
- **Security**: Row Level Security (RLS) policies for data protection

### ✅ Advanced Features
- **Context Awareness**: AI maintains conversation context across messages
- **Session Analytics**: Track user engagement and AI performance
- **Automatic Cleanup**: Old sessions and messages are automatically cleaned up
- **Performance Optimization**: Indexed database queries for fast retrieval
- **Error Handling**: Comprehensive error handling with fallback responses

## 📋 Prerequisites

1. **Supabase Project**: Set up with authentication enabled
2. **DeepSeek API Key**: Get your API key from [DeepSeek Platform](https://platform.deepseek.com/)
3. **Node.js**: Version 16 or higher
4. **Expo CLI**: Latest version installed

## 🛠️ Setup Instructions

### Step 1: Environment Configuration

1. Copy the environment template:
```bash
cp env.example .env
```

2. Update your `.env` file with the following variables:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# DeepSeek Configuration
EXPO_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_TEMPERATURE=0.7
DEEPSEEK_MAX_TOKENS=1000

# Chat Configuration
CHAT_SESSION_TIMEOUT_HOURS=24
CHAT_MAX_MESSAGES_PER_SESSION=1000
CHAT_CLEANUP_INTERVAL_DAYS=30
```

### Step 2: Database Setup

1. **Set up the complete database schema:**
```bash
npm run setup-full-database
```

2. **Or set up chat features separately:**
```bash
npm run setup-chat-database
```

### Step 3: Test the Integration

1. **Test the complete integration:**
```bash
npm run test-full-integration
```

2. **Or test chat features separately:**
```bash
npm run test-chat-integration
```

### Step 4: Start the Application

```bash
npm start
```

## 🏗️ Architecture Overview

### Database Schema

#### Chat Sessions Table
```sql
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_name VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_messages INTEGER DEFAULT 0,
  session_context JSONB DEFAULT '{}'
);
```

#### Chat Messages Table
```sql
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'ai', 'system')),
  content TEXT NOT NULL,
  context_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_analysis_context BOOLEAN DEFAULT FALSE,
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER
);
```

### Service Architecture

#### DeepSeekChatService
- **Purpose**: Core AI integration with DeepSeek API
- **Features**: Session management, message persistence, context handling
- **Location**: `lib/services/ai-service.ts`

#### ChatService
- **Purpose**: High-level chat management
- **Features**: Session switching, history management, user interface
- **Location**: `lib/services/chat-service.ts`

#### API Routes
- **Sessions**: `/api/chat/sessions/` - CRUD operations for chat sessions
- **Messages**: `/api/chat/messages/` - Message storage and retrieval
- **Send**: `/api/chat/send/` - Send messages with AI processing

## 🔧 Configuration Options

### DeepSeek API Configuration

You can customize the AI behavior by modifying the `DeepSeekConfig`:

```typescript
const config: DeepSeekConfig = {
  model: 'deepseek-chat',
  temperature: 0.7,        // Creativity level (0-1)
  max_tokens: 1000,        // Maximum response length
  top_p: 0.9,             // Nucleus sampling
  frequency_penalty: 0.0,  // Reduce repetition
  presence_penalty: 0.0    // Encourage new topics
};
```

### Chat Session Configuration

```typescript
// Session timeout (hours)
CHAT_SESSION_TIMEOUT_HOURS=24

// Maximum messages per session
CHAT_MAX_MESSAGES_PER_SESSION=1000

// Cleanup interval for old sessions
CHAT_CLEANUP_INTERVAL_DAYS=30
```

## 📊 Analytics and Monitoring

### Available Analytics Functions

1. **User Chat Statistics**:
```sql
SELECT * FROM get_user_chat_stats('user-uuid');
```

2. **Session Summary**:
```sql
SELECT * FROM chat_session_summary WHERE user_id = 'user-uuid';
```

3. **User Analytics**:
```sql
SELECT * FROM user_chat_analytics WHERE user_id = 'user-uuid';
```

### Performance Monitoring

- **Token Usage**: Track AI token consumption per session
- **Response Time**: Monitor AI response latency
- **Session Activity**: Track user engagement patterns
- **Error Rates**: Monitor API failure rates

## 🛡️ Security Features

### Row Level Security (RLS)
- Users can only access their own chat sessions and messages
- Automatic data isolation between users
- Secure API endpoints with authentication

### Data Protection
- All messages encrypted in transit
- Session data isolated per user
- Automatic cleanup of old data
- No cross-user data leakage

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check Supabase URL and keys
   - Verify network connectivity
   - Run `npm run test-database`

2. **DeepSeek API Errors**
   - Verify API key is correct
   - Check API quota and limits
   - Monitor response status codes

3. **Chat Sessions Not Persisting**
   - Check RLS policies
   - Verify user authentication
   - Check database permissions

4. **Slow Response Times**
   - Check database indexes
   - Monitor API response times
   - Consider connection pooling

### Debug Commands

```bash
# Test database connection
npm run test-database

# Test chat integration
npm run test-chat-integration

# Test complete integration
npm run test-full-integration

# Reset database (careful!)
npm run reset-database
```

## 📈 Performance Optimization

### Database Indexes
- Optimized for fast session and message queries
- Indexed on user_id, session_id, and created_at
- Full-text search capabilities

### Caching Strategy
- Session data cached in memory
- Message history paginated for performance
- Automatic cleanup of old data

### API Optimization
- Request batching for multiple messages
- Connection pooling for database
- Error retry mechanisms

## 🔄 Maintenance

### Regular Maintenance Tasks

1. **Clean up old sessions**:
```sql
SELECT cleanup_old_sessions();
```

2. **Monitor token usage**:
```sql
SELECT user_id, SUM(tokens_used) as total_tokens 
FROM chat_messages 
GROUP BY user_id 
ORDER BY total_tokens DESC;
```

3. **Check session health**:
```sql
SELECT COUNT(*) as active_sessions 
FROM chat_sessions 
WHERE is_active = true;
```

## 📚 API Documentation

### Chat Sessions API

#### GET `/api/chat/sessions`
- **Purpose**: Get user's chat sessions
- **Parameters**: `userId` (query)
- **Response**: Array of chat sessions

#### POST `/api/chat/sessions`
- **Purpose**: Create new chat session
- **Body**: `{ userId, sessionName? }`
- **Response**: Created session object

### Chat Messages API

#### GET `/api/chat/messages`
- **Purpose**: Get messages for a session
- **Parameters**: `sessionId` (query), `limit?` (query)
- **Response**: Array of messages

#### POST `/api/chat/messages`
- **Purpose**: Store a message
- **Body**: `{ userId, sessionId, messageType, content, contextData?, tokensUsed?, responseTimeMs? }`
- **Response**: Created message object

### Send Message API

#### POST `/api/chat/send`
- **Purpose**: Send message and get AI response
- **Body**: `{ userId, message, sessionId?, context? }`
- **Response**: AI response with metadata

## 🎯 Usage Examples

### Basic Chat Usage

```typescript
import { ChatService } from './lib/services/chat-service';

const chatService = new ChatService(userId);

// Send a message
const messages = await chatService.sendMessage("What are the current market trends?");

// Get chat history
const history = await chatService.getChatHistory();

// Create new session
const session = await chatService.initializeSession("Investment Discussion");
```

### Advanced Features

```typescript
// Switch between sessions
await chatService.switchSession(sessionId);

// Get user's sessions
const sessions = await chatService.getUserSessions();

// End current session
await chatService.endSession();
```

## 🎉 Success!

Your DeepSeek chat integration is now fully set up and ready to use! The system provides:

- ✅ Complete AI chat functionality
- ✅ Persistent session management
- ✅ Database integration with Supabase
- ✅ Security and performance optimization
- ✅ Analytics and monitoring
- ✅ Comprehensive error handling

Start chatting with your AI financial advisor and explore the Jamaican and Caribbean markets!
