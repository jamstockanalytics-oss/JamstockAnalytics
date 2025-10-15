JamstockAnalytics - README

JamstockAnalytics** is an AI-powered mobile application that provides intelligent financial news analysis and market insights for Jamaican stocks on the JSE and Junior Markets.

📱 App Overview

JamstockAnalytics helps investors, analysts, and financial enthusiasts cut through the noise of financial news by leveraging AI to prioritize, analyze, and provide actionable insights about Jamaican companies.

🎯 Key Features

🔍 Smart News Intelligence
- **AI-Prioritized Jamaican Financial News**: Articles sorted by relevance and market impact
- **JSE & Junior Market Focus**: Specialized coverage of Jamaican stocks
- **Real-time Market Updates**: Live prices and breaking news
- **Sentiment Analysis**: AI-driven scoring of news sentiment

 🤖 JamAI Robo-Advisor
- **DeepSeek-Powered Analysis**: Intelligent conversations about Jamaican market trends
- **Personalized Stock Insights**: Tailored recommendations for your watchlist
- **Financial Analysis Mode**: Deep research sessions for comprehensive analysis
- **Educational Investment Guidance**: Data-driven market insights

📊 Jamaican Market Analytics
- **JSE Performance Tracking**: Real-time stock prices and trends
- **Portfolio Management**: Watchlists and personalized tracking
- **Company Intelligence**: Comprehensive analysis of Jamaican businesses
- **Session Analytics**: Track your research progress and insights

 🏗 Architecture

Frontend
- **Expo React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Native styling
- **React Navigation** - Seamless app flow

Backend & Database
- **Supabase** - PostgreSQL database with real-time capabilities
- **Row Level Security** - Data protection
- **Real-time Subscriptions** - Live updates

AI Integration
- **DeepSeek API** - AI chat and analysis
- **Custom RAG System** - Jamaica-focused financial context
- **Model Selection**:
  - `deepseek-chat` for general conversations
  - `deepseek-reasoner` for complex financial analysis

🚀 Quick Start

Prerequisites
- Node.js 18+
- Expo CLI
- Supabase account
- DeepSeek API account

Installation

1. **Clone and Setup**
```bash
git clone <repository-url>
cd jamstockanalytics
npm install
```

2. Environment Configuration**
Create `.env` file:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
EXPO_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_key
```

3. Database Setup**
Execute the Supabase schema from `database/schema.sql`

4. Start Development**
```bash
npx expo start
```

📱 App Flow

User Journey
```
Welcome Screen → Sign Up → Main Dashboard → [Read News | Chat with JamAI | Analysis Mode] → Session Results
```

### Core Screens

1. Welcome Screen**
   - Clean, professional Jamaican market-themed design
   - Email authentication setup

2. Main Dashboard**
   - AI-prioritized news feed ("Jamaica Finance News - Sorted by AI Priority")
   - Quick access to JamAI chat
   - "Analysis Mode" entry point
   - Watchlist overview

3. News Features**
   - Article cards with AI priority scores
   - Company ticker tags (NCBFG, SGJ, etc.)
   - Sentiment indicators
   - Save and share functionality

4. JamAI Chat Interface**
   - Natural language queries about Jamaican stocks
   - Context-aware responses using recent news
   - Investment analysis and explanations

5. Analysis Mode**
   - Focused research environment
   - Structured analysis templates
   - Session progress tracking
   - Exportable insights

🗄 Database Schema Highlights

Core Tables
- `users` - User profiles and preferences
- `news_articles` - Jamaican financial news with AI metadata
- `jse_companies` - JSE and Junior Market company data
- `ai_chat_sessions` - JamAI conversation history
- `analysis_sessions` - User research sessions
- `user_watchlists` - Personalized stock tracking

Key Jamaican Market Data
- JSE Main Market indices and stocks
- Junior Market companies
- Jamaican financial news sources
- Exchange rates (JMD/USD)

🎨 Design System

Brand Identity
- **Colors**: Jamaican-inspired palette (green, gold, black)
- **Typography**: Professional financial data presentation
- **Icons**: Custom Jamaican market-themed icons
- **Layout**: Card-based for easy information digestion

User Experience
- **Jamaican Market Context**: Localized terminology and data presentation
- **Performance**: Optimized for Jamaican internet conditions
- **Accessibility**: WCAG compliant with local considerations

🔌 Integration Points

Jamaican Data Sources
- **JSE Official Data**: Stock prices and company information
- **Local News Outlets**: Jamaica Observer, Gleaner, RJR Financial
- **Regulatory Feeds**: BOJ announcements, JSE regulatory releases

AI Configuration
```javascript
// JamAI Configuration
const jamAI = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1'
})

// Jamaican Market Context
const systemPrompt = `You are JamAI, a specialized AI for Jamaican stock market analysis...`
```

📈 Deployment

Build Process
```bash
# Build for production
eas build --platform android
eas build --platform ios

# Deploy updates
eas update
```

App Store Preparation
- Jamaican financial compliance review
- Localized app store listings
- Jamaican-specific screenshots

 🔒 Security & Compliance

Data Protection
- Jamaican data residency considerations
- Secure financial data handling
- User privacy protection

Financial Compliance
- Educational purpose disclosures
- Risk warnings for investment advice
- Jamaican financial regulations adherence

🤝 Contributing

 Development Focus Areas
1. **Jamaican Market Data Integration**
2. **Local News Source Expansion**
3. **JSE-Specific Analysis Features**
4. **Jamaican User Experience Optimization**

Code Standards
- TypeScript for type safety
- Jamaican market context in documentation
- Localized user experience testing

📞 Support

Jamaican Financial Context
- Local market hours consideration
- Jamaican holiday schedules
- Local financial terminology

 Documentation
- [API Integration Guide](./docs/api.md)
- [JSE Data Sources](./docs/jse-sources.md)
- [Local Deployment Guide](./docs/deployment.md)

---
Built for the Jamaican Investment Community 🇯🇲**

*Empowering smarter investment decisions through AI-powered market intelligence*
