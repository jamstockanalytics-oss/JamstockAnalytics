# AI Integration Setup Guide

## DeepSeek AI Configuration

To enable AI functionality in your JamStockAnalytics app, you need to set up the DeepSeek API:

### 1. Get DeepSeek API Key

1. Visit [DeepSeek Platform](https://platform.deepseek.com/)
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key

### 2. Configure Environment Variables

Add the following to your `.env` file in the project root:

```env
# AI Configuration
EXPO_PUBLIC_DEEPSEEK_API_KEY=sk-8d23257f2c254d7390066067a005b564
```

### 3. Features Enabled with AI

Once configured, the following AI features will be available:

#### 🤖 AI Chat Interface
- **Location**: Chat tab in the app
- **Features**:
  - Conversational AI for financial advice
  - Market trend discussions
  - Investment guidance
  - Quick suggestion chips
  - Context-aware responses

#### 📊 AI News Analysis
- **Location**: Article detail screens
- **Features**:
  - Automatic news article analysis
  - Priority scoring (1-10)
  - AI-generated summaries
  - Market impact assessment
  - Sentiment analysis
  - Investment recommendations

#### 🎯 AI-Powered Priority Scoring
- **Location**: News feed and article cards
- **Features**:
  - Articles sorted by AI priority
  - Visual priority indicators
  - Market relevance scoring

#### 💬 Smart Chat Suggestions
- **Location**: Chat interface
- **Features**:
  - Contextual suggestion chips
  - Related topic recommendations
  - Quick action buttons

### 4. AI Service Architecture

The AI integration includes:

- **`lib/services/ai-service.ts`**: Core AI functionality
- **`lib/services/chat-service.ts`**: Chat message handling
- **`lib/services/news-service.ts`**: News analysis integration

### 5. Fallback Behavior

If the AI API is not configured or fails:
- Chat will show helpful fallback messages
- News articles will display sample data
- All features remain functional with mock data

### 6. Development vs Production

- **Development**: Uses fallback responses when API key is missing
- **Production**: Requires valid DeepSeek API key for full functionality

### 7. Cost Considerations

- DeepSeek offers competitive pricing
- Monitor usage through their dashboard
- Consider implementing rate limiting for production use

### 8. Security Notes

- API key is exposed to client (use EXPO_PUBLIC_ prefix)
- Consider implementing server-side proxy for production
- Monitor API usage and implement safeguards

## Next Steps

1. Get your DeepSeek API key
2. Add it to your `.env` file
3. Restart the development server
4. Test AI features in the app

The AI integration is designed to enhance user experience while maintaining app functionality even without AI services.
