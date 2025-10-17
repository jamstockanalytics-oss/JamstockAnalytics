# JamStockAnalytics - AI-Powered Financial News Analysis

A comprehensive mobile and web application designed to aggregate, prioritize, and analyze financial news related to companies on the Jamaica Stock Exchange (JSE) and the Junior Stock Exchange using AI-powered insights.

## 🎯 **Core Features**

### **📰 Financial News Analysis**
- AI-powered news aggregation from Jamaican financial sources
- Intelligent content prioritization and scoring
- Real-time news updates and market insights
- Company-specific news filtering and analysis

### **🤖 AI Chat Integration**
- DeepSeek-powered conversational AI
- Context-aware financial analysis and insights
- Market trend discussions and explanations
- Investment guidance and risk assessment

### **👤 User Management**
- Secure authentication with Supabase
- User profiles and preferences
- User blocking and moderation system
- Comment system with interaction tracking

### **📊 Market Data Integration**
- JSE market data and company information
- Real-time stock prices and market updates
- Company ticker management and tracking
- Market analysis and trend identification

### **🔍 Analysis Tools**
- User analysis sessions and note-taking
- Article saving and organization
- Investment research and documentation
- Session tracking and progress monitoring

### **🌐 Web Interface**
- Lightweight web application
- Responsive design for all devices
- Optimized for minimal data usage
- Offline capability with service workers

### **🧠 Machine Learning Agent**
- Basic ML agent for content curation
- User behavior learning and adaptation
- Content recommendation system
- Performance tracking and optimization

## 🛠️ **Tech Stack**

- **Frontend**: React Native with TypeScript, Expo, and Expo Router
- **Backend/Database**: Supabase (PostgreSQL)
- **UI Framework**: React Native Paper
- **AI Processing**: DeepSeek API
- **State Management**: React Context API
- **Navigation**: Expo Router
- **Styling**: React Native Paper + Custom Components

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ and npm
- Expo CLI
- Supabase account
- DeepSeek API key

### **Installation**
```bash
# Clone the repository
git clone https://github.com/junior876/JamStockAnalytics.git
cd JamStockAnalytics

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your Supabase and DeepSeek credentials

# Start the development server
npm start
```

### **Environment Setup**
```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Service Configuration
EXPO_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key
```

## 📱 **Platform Support**

- **iOS**: Native iOS app with full feature support
- **Android**: Native Android app with full feature support
- **Web**: Progressive Web App (PWA) with offline capability
- **Responsive**: Optimized for all screen sizes and devices

## 🗄️ **Database Schema**

The application uses Supabase (PostgreSQL) with the following core tables:

- **Users**: User profiles, preferences, and authentication
- **Articles**: News articles with AI analysis and prioritization
- **Company Tickers**: JSE company information and ticker symbols
- **Analysis Sessions**: User analysis and note-taking sessions
- **Chat Messages**: AI chat conversations and context
- **User Blocks**: User moderation and blocking system
- **ML Agent**: Machine learning patterns and content curation

## 🧪 **Testing**

```bash
# Test core functionality
node test-core-functionality.js

# Test individual features
npm run test

# Test database connection
node test-supabase-connection.js
```

## 📚 **Documentation**

- **Setup Guide**: `ENVIRONMENT_SETUP_GUIDE.md`
- **Database Setup**: `DATABASE_SETUP_SUMMARY.md`
- **Application Testing**: `APPLICATION_TESTING_GUIDE.md`
- **News Scraping**: `NEWS_SCRAPING_SETUP.md`
- **Deployment**: `PRODUCTION_DEPLOYMENT_GUIDE.md`

## 🚀 **Deployment**

### **Web Deployment**
```bash
# Build for web
npm run build:web

# Deploy to Vercel/Netlify
npm run deploy:web
```

### **Mobile Deployment**
```bash
# Build for iOS/Android
npx eas build --platform all

# Submit to app stores
npx eas submit --platform all
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 **Roadmap**

- Enhanced AI processing and analysis
- Advanced analytics and market insights
- Real-time updates and live data feeds
- Cross-platform integration with more data sources
- Predictive insights and market forecasting

---

**Built with ❤️ for the Jamaican financial community**
