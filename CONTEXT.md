# Financial News Analyzer: JamStockAnalyticsAI

## 1. Overview

This document outlines the specifications for a web application designed to aggregate, prioritize, and help users analyze financial news related to companies on the Jamaica Stock Exchange (JSE) and the Junior Stock Exchange. The core value proposition is leveraging AI to cut through the noise and provide actionable insights.

**Tech Stack:**
- Frontend: Modern Web Application (HTML5, CSS3, JavaScript/TypeScript)
- Backend/Database: Supabase
- UI Framework: Responsive Web Design
- AI Processing: DeepSeek

---

## 2. Application Flow & User Journey

The user journey is linear and intuitive, guiding the user from initial discovery to deep analysis.

### Flowchart Summary:
```
Welcome Page → Sign Up / Log In → Main Dashboard → [Read Article] OR [Chat with AI] → Enter Analysis Mode → Session Complete & Progress → Return to Dashboard
```

---

## 3. Detailed Screen & Feature Specifications

### 3.1. Welcome Page

**Objective:** To provide a clean, professional first impression and guide the user to authenticate.

**UI Components:**
- Website Logo & Name
- A brief, compelling tagline (e.g., "Master the JSE with AI-Powered Insights")
- A "Sign Up with Email" button
- A "Log In" link for returning users

**Functionality:**
- Clicking "Sign Up with Email" navigates to the Sign-Up page
- Clicking "Log In" navigates to the Login page

### 3.2. Authentication Pages

**Objective:** To securely register and authenticate users.

**UI Components (Sign Up):**
- Full Name input field
- Email input field
- Password input field (with strength indicator)
- "Create Account" button
- Link to "Already have an account? Log In"

**UI Components (Log In):**
- Email input field
- Password input field
- "Log In" button
- Link to "Don't have an account? Sign Up"
- "Forgot Password?" link

**Functionality:**
- Input validation (email format, password length)
- Supabase Auth integration for user registration/login
- Upon successful authentication, the user is redirected to the Main Dashboard

### 3.3. Main Dashboard

**Objective:** The central hub where users consume prioritized news and access core features.

**UI Components:**
- **Header:** Contains the website logo, user profile icon (leading to settings), and a "Analysis Mode" button (prominent, possibly styled differently)
- **Welcome Header:** "Good [Morning/Afternoon], [User Name]"
- **AI Priority Toggle/Section Header:** A header clearly stating "Jamaica Finance News - Sorted by AI Priority"
- **News Feed (Primary Component):** A vertically scrolling list of news article cards
- **Chat Button:** For initiating a chat with the AI

**Article Card Components:**
- Article Headline
- Source Publication & Publication Date/Time
- Relevant Company Ticker(s) (e.g., `JSE:NCBFG`, `JSE:SGJ`)
- An **AI Priority Indicator** (e.g., a score out of 10, a "High Impact" badge, or a heatmap-style color code)
- A brief, AI-generated summary snippet (1-2 lines)

**Functionality:**
- The list is automatically sorted by the `AI Priority` score (descending)
- Refresh button to fetch the latest news
- Clicking an article card opens the full article in an Article Detail page
- Clicking the "Analysis Mode" button navigates the user to the Analysis Mode page
- Clicking the Chat Button opens the AI Chat interface

### 3.4. Article Detail Page

**Objective:** To display the full content of a selected news article.

**UI Components:**
- Top navigation bar with a "Back" button
- Article headline, source, date, and tickers
- Article content rendered in a clean, readable format
- A footer with action buttons: "Share", "Save", and a "Analyze this in AI Chat" button

**Functionality:**
- The "Analyze this in AI Chat" button pre-populates the chat input with the article's headline/URL for context

### 3.5. AI Chat Interface

**Objective:** To allow users to have conversational queries about the news, specific companies, or market trends.

**UI Components:**
- A header: "Market Analyst AI"
- A scrollable message list (Chat bubbles: user messages on one side, AI responses on the other)
- A text input field at the bottom with a "Send" button

**Functionality:**
- The AI context should be aware of the user's location (Jamaica), the JSE/Junior Market, and the stream of news articles in the application's database
- It should be able to answer questions like:
  - "Summarize the latest news about NCB Financial Group"
  - "What was the market reaction to the latest BOJ policy announcement?"
  - "Compare the financial performance of Sagicor and Guardian Holdings last quarter"

### 3.6. Analysis Mode

**Objective:** A focused, session-based environment for deep, structured financial analysis.

**UI Components:**
- A full-page, immersive interface with a minimalistic design to reduce distraction
- A central workspace (could be a canvas, a structured form, or a chat-like interface specifically for analysis)
- Tools accessible via a toolbar (e.g., Notepad, Stock Price Charts, Company Financials, News Timeline)
- A "Complete Session" button

**Functionality:**
- Entering this mode signifies the user's intent to perform a dedicated analysis task
- The application can provide templates: "Bullish/Bearish Thesis," "Event Impact Analysis," "Company Comparison"
- Users can pull in specific articles, charts, and data into their workspace
- The session is timed (optional feature for productivity)
- All user actions, notes, and conclusions within the session are saved

### 3.7. Session Complete & Progress Page

**Objective:** To provide closure, show accomplishment, and summarize the user's analytical work.

**UI Components:**
- A congratulatory message: "Session Complete!"
- **Session Summary:**
  - Session Duration
  - Number of articles analyzed
  - Key takeaways/decisions logged by the user (displayed as a list)
  - A "Download/Export Notes" button
- **Action Buttons:**
  - **"Start New Session"**: Clears the previous workspace and returns to Analysis Mode
  - **"Take a Break"**: Returns the user to the Main Dashboard

**Functionality:**
- Persists a log of all analysis sessions in the user's profile for later review

---

## 4. Data Schema & Database Design

### 4.1. Supabase Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferences JSONB DEFAULT '{}',
  subscription_tier VARCHAR(50) DEFAULT 'free',
  last_active TIMESTAMP WITH TIME ZONE,
  profile_image_url TEXT
);
```

#### Articles Table
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  headline TEXT NOT NULL,
  source VARCHAR(255) NOT NULL,
  url TEXT UNIQUE NOT NULL,
  content TEXT,
  publication_date TIMESTAMP WITH TIME ZONE NOT NULL,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_priority_score DECIMAL(3,2) DEFAULT 0.00,
  ai_summary TEXT,
  sentiment_score DECIMAL(3,2),
  relevance_score DECIMAL(3,2),
  company_tickers TEXT[],
  tags TEXT[],
  is_processed BOOLEAN DEFAULT FALSE,
  processing_status VARCHAR(50) DEFAULT 'pending'
);
```

#### Company Tickers Table
```sql
CREATE TABLE company_tickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker VARCHAR(20) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  exchange VARCHAR(50) NOT NULL, -- 'JSE' or 'Junior'
  sector VARCHAR(100),
  market_cap BIGINT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Analysis Sessions Table
```sql
CREATE TABLE analysis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_name VARCHAR(255),
  session_type VARCHAR(50), -- 'bullish_thesis', 'bearish_thesis', 'event_analysis', 'company_comparison'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  notes TEXT,
  key_takeaways TEXT[],
  articles_analyzed UUID[],
  session_data JSONB DEFAULT '{}',
  is_completed BOOLEAN DEFAULT FALSE
);
```

#### User Saved Articles Table
```sql
CREATE TABLE user_saved_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  tags TEXT[],
  UNIQUE(user_id, article_id)
);
```

#### Chat Messages Table
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID, -- Optional: link to analysis session
  message_type VARCHAR(20) NOT NULL, -- 'user' or 'ai'
  content TEXT NOT NULL,
  context_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_analysis_context BOOLEAN DEFAULT FALSE
);
```

#### News Sources Table
```sql
CREATE TABLE news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  base_url TEXT NOT NULL,
  rss_feed_url TEXT,
  api_endpoint TEXT,
  scraping_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  priority_score INTEGER DEFAULT 1,
  last_scraped TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.2. Database Indexes
```sql
-- Performance indexes
CREATE INDEX idx_articles_priority ON articles(ai_priority_score DESC);
CREATE INDEX idx_articles_date ON articles(publication_date DESC);
CREATE INDEX idx_articles_tickers ON articles USING GIN(company_tickers);
CREATE INDEX idx_articles_processed ON articles(is_processed);
CREATE INDEX idx_analysis_sessions_user ON analysis_sessions(user_id);
CREATE INDEX idx_analysis_sessions_completed ON analysis_sessions(is_completed);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
```

### 4.3. Row Level Security (RLS) Policies
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can access own analysis sessions" ON analysis_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own saved articles" ON user_saved_articles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own chat messages" ON chat_messages FOR ALL USING (auth.uid() = user_id);
```

---

## 5. Project Structure

### 5.1. Web Application Project Structure
```
JamStockAnalytics/
├── pages/                        # Web pages directory
│   ├── auth/                     # Authentication pages
│   │   ├── login.html
│   │   ├── signup.html
│   │   └── forgot-password.html
│   ├── dashboard/                # Main application pages
│   │   ├── index.html            # Dashboard/News Feed
│   │   ├── chat.html             # AI Chat
│   │   ├── analysis.html         # Analysis Mode
│   │   └── profile.html          # User Profile
│   ├── article/
│   │   └── [id].html             # Article Detail (dynamic route)
│   ├── analysis-session/
│   │   ├── [id].html             # Active Analysis Session
│   │   └── complete.html         # Session Complete Page
│   ├── index.html                # Home page
│   └── 404.html                  # Not found page
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── Input.js
│   │   ├── LoadingSpinner.js
│   │   └── index.js
│   ├── news/                     # News-specific components
│   │   ├── ArticleCard.js
│   │   ├── NewsFeed.js
│   │   ├── PriorityIndicator.js
│   │   └── index.js
│   ├── chat/                     # Chat components
│   │   ├── ChatBubble.js
│   │   ├── ChatInput.js
│   │   ├── MessageList.js
│   │   └── index.js
│   ├── analysis/                 # Analysis components
│   │   ├── AnalysisWorkspace.js
│   │   ├── SessionTimer.js
│   │   ├── NotesPanel.js
│   │   └── index.js
│   └── layout/                   # Layout components
│       ├── AppHeader.js
│       ├── Navigation.js
│       ├── Sidebar.js
│       └── index.js
├── lib/                          # Core utilities and configurations
│   ├── supabase/                 # Supabase configuration
│   │   ├── client.js
│   │   ├── types.js
│   │   └── queries.js
│   ├── ai/                       # AI/ML integration
│   │   ├── deepseek.js
│   │   ├── priority-engine.js
│   │   ├── summarizer.js
│   │   └── prompts.js
│   ├── services/                 # Business logic services
│   │   ├── news-service.js
│   │   ├── analysis-service.js
│   │   ├── chat-service.js
│   │   └── user-service.js
│   ├── utils/                    # Utility functions
│   │   ├── date-utils.js
│   │   ├── validation.js
│   │   ├── formatting.js
│   │   └── constants.js
│   ├── modules/                  # JavaScript modules
│   │   ├── auth.js
│   │   ├── news.js
│   │   ├── analysis.js
│   │   └── chat.js
│   └── types/                    # Type definitions
│       ├── database.js
│       ├── api.js
│       ├── navigation.js
│       └── index.js
├── assets/                       # Static assets
│   ├── images/
│   │   ├── logo.png
│   │   ├── icons/
│   │   └── illustrations/
│   ├── fonts/
│   └── data/
│       ├── company-tickers.json
│       └── news-sources.json
├── constants/                    # Application constants
│   ├── Colors.js
│   ├── Layout.js
│   ├── Config.js
│   └── index.js
├── styles/                       # CSS and styling
│   ├── main.css
│   ├── components.css
│   ├── responsive.css
│   └── themes.css
├── scripts/                      # Build and utility scripts
│   ├── setup-database.sql
│   ├── seed-data.js
│   └── deploy.sh
├── docs/                         # Documentation
│   ├── api.md
│   ├── deployment.md
│   └── contributing.md
├── .env.example                  # Environment variables template
├── .gitignore
├── index.html                    # Main entry point
├── package.json
├── webpack.config.js             # Build configuration
└── README.md
```

---

## 6. Core User Stories

1. **As a new user,** I can sign up with my email so that I can have a personalized experience
2. **As a user,** I can see a list of Jamaican financial news sorted by AI-predicted importance so that I can focus on what matters most
3. **As a user,** I can read the full text of any news article within the application
4. **As a user,** I can ask an AI questions in plain English about the news and get insightful, context-aware answers
5. **As a user,** I can enter a dedicated "Analysis Mode" to perform deep, uninterrupted research on specific companies or events
6. **As a user,** I can view a summary of my completed analysis session and my progress over time

---

## 7. Technical & Backend Considerations

### 7.1. Data Layer

**News Aggregation:** A backend service (e.g., Python, Node.js) to scrape/aggregate news from predefined Jamaican financial sources (e.g., Jamaica Observer, Gleaner, RJR, etc.) using RSS feeds or APIs.

**Database (Supabase PostgreSQL):**
- `Users` Collection: User profiles, preferences, saved articles
- `Articles` Collection: Headline, source, URL, content, publication date, `company_tickers[]`, `ai_priority_score` (calculated by the AI model), `ai_summary`
- `AnalysisSessions` Collection: Linked to User ID, contains session data, notes, duration, etc.

### 7.2. AI & Machine Learning

**Priority Engine:** An NLP model to analyze each article and assign a `ai_priority_score`. Scoring factors: company market cap, mentioned financial metrics (revenue, profit), sentiment, uniqueness of news.

**Summarization Model:** A model to generate the summary snippets for article cards.

**Chat AI:** Integration with DeepSeek API. A robust **prompt engineering system** is critical here to ensure the AI acts as a Jamaica-focused financial analyst and does not hallucinate or provide generic advice. It must be constrained to the provided news context.

### 7.3. Key Dependencies

**Frontend:** State Management (Context API), HTTP Client (Axios), Database SDK (Supabase).

**Backend:** Web Scraping Frameworks (Beautiful Soup, Scrapy), Cloud Functions (Supabase Edge Functions), AI/ML API Endpoints.

**Authentication:** Supabase Auth.

---

## 8. Success Metrics

- **User Engagement:** Daily active users, session duration, articles read per session
- **AI Effectiveness:** User satisfaction with AI responses, analysis session completion rates
- **Content Quality:** AI priority score accuracy, user feedback on news relevance
- **Retention:** Weekly and monthly user retention rates

---

## 9. Future Enhancements

- **Push Notifications:** For high-priority news alerts
- **Portfolio Integration:** Connect user's stock holdings for personalized news filtering
- **Social Features:** Share analysis insights with other users
- **Advanced Analytics:** Historical trend analysis and predictive insights
- **Multi-language Support:** For broader Caribbean market coverage

---

## 10. Project Setup Instructions

```bash
# From your Documents folder
cd "C:\Users\junio\OneDrive\Documents"

# Create project directory
mkdir JamStockAnalytics
cd JamStockAnalytics

# Initialize package.json
npm init -y

# Install core dependencies
npm install @supabase/supabase-js axios zod

# Install development dependencies
npm install --save-dev webpack webpack-cli webpack-dev-server

# Create basic project structure
mkdir pages components lib assets styles scripts docs

# Create environment file
echo "# Environment Variables" > .env.example
echo "SUPABASE_URL=your_supabase_url" >> .env.example
echo "SUPABASE_ANON_KEY=your_supabase_anon_key" >> .env.example
echo "DEEPSEEK_API_KEY=your_deepseek_api_key" >> .env.example

# Create main HTML file
echo "<!DOCTYPE html>" > index.html
echo "<html><head><title>JamStockAnalytics</title></head><body></body></html>" >> index.html

# Start development server
npm run dev
```

---

## 11. Enhanced Features

### 11.1. Guest Access & Pro Mode

**Guest User Capabilities:**
- ✅ **Basic News Access:** View latest Jamaica Stock Exchange news
- ✅ **News Reading:** Read full articles without authentication
- ✅ **Basic Navigation:** Access main dashboard and news feed
- ✅ **Limited AI Chat:** Basic chat functionality

**Guest User Limitations:**
- ❌ **AI Analysis Mode:** Requires Pro subscription
- ❌ **Personalized Insights:** No AI-powered personalization
- ❌ **Advanced Features:** Limited to basic functionality
- ❌ **Data Persistence:** No saved articles or preferences

### 11.2. User Blocking and Moderation System

**User Blocking Capabilities:**
- ✅ **Block Users:** Users can block other users with specific reasons
- ✅ **Block Reasons:** Harassment, spam, inappropriate content, misinformation, other
- ✅ **Temporary Blocks:** Set expiration dates for temporary blocks
- ✅ **Permanent Blocks:** Indefinite blocking until manually unblocked
- ✅ **Block Management:** View and manage blocked users list

**Content Filtering:**
- ✅ **Comment Filtering:** Blocked users' comments are hidden from view
- ✅ **Activity Hiding:** Blocked users cannot see blocker's activity
- ✅ **Bidirectional Blocking:** Both users are prevented from seeing each other
- ✅ **Real-time Filtering:** Automatic content filtering based on block status

### 11.3. Lightweight Web UI

**Performance First:**
- **Minimal Bundle Size:** Optimized components with reduced JavaScript footprint
- **Lazy Loading:** Components and content loaded only when needed
- **Compressed Assets:** All static assets compressed for faster delivery
- **Caching Strategy:** Intelligent caching for offline capability

**Data Efficiency:**
- **Lightweight Mode:** Default mode optimized for minimal data usage
- **Image Optimization:** Images disabled by default, with option to enable
- **Content Compression:** All API responses compressed using gzip
- **Smart Caching:** Aggressive caching to reduce repeated data transfers

### 11.4. Fallback Response System

**Automatic Error Detection:**
- ✅ **402 Payment Required** → Quota exceeded handling
- ✅ **429 Too Many Requests** → Rate limiting management
- ✅ **500+ Server Errors** → Service unavailable fallback
- ✅ **Network Errors** → Connection failure handling
- ✅ **Timeout Scenarios** → Request timeout management

**Intelligent Response Generation:**
- ✅ **Company Queries** → JSE company information and guidance
- ✅ **Investment Advice** → General investment principles and warnings
- ✅ **Market Analysis** → Market insights and data sources
- ✅ **General Finance** → Financial planning guidance

### 11.5. Independent Machine Learning Agent

**Fully Independent Operation:**
- ✅ **Autonomous Learning** - Learns from user interactions, article performance, and market data
- ✅ **Self-Training** - Automatically retrains every 6 hours when sufficient data is available
- ✅ **Pattern Recognition** - Identifies user preferences, market trends, and content quality patterns
- ✅ **Article Curation** - Automatically curates and prioritizes articles based on learned patterns
- ✅ **No Human Intervention** - Operates completely independently using local ML models

**Advanced Machine Learning:**
- ✅ **DeepSeek Integration** - Uses DeepSeek API for sophisticated pattern analysis
- ✅ **Reinforcement Learning** - Continuously improves based on user feedback and performance
- ✅ **Multi-Pattern Learning** - Recognizes user preferences, market trends, content quality, and timing optimization
- ✅ **Confidence Scoring** - Provides confidence levels for all predictions and recommendations

---

## 12. Database Schema Extensions

### 12.1. User Blocking Tables

```sql
CREATE TABLE public.user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reason VARCHAR(100) CHECK (reason IN ('harassment', 'spam', 'inappropriate_content', 'misinformation', 'other')),
  reason_details TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unblocked_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);
```

### 12.2. Web UI Preferences

```sql
CREATE TABLE public.web_ui_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light',
  layout_mode VARCHAR(20) DEFAULT 'lightweight',
  data_saver BOOLEAN DEFAULT TRUE,
  auto_refresh BOOLEAN DEFAULT FALSE,
  refresh_interval INTEGER DEFAULT 300,
  max_articles_per_page INTEGER DEFAULT 10,
  enable_images BOOLEAN DEFAULT FALSE,
  enable_animations BOOLEAN DEFAULT FALSE,
  compact_mode BOOLEAN DEFAULT TRUE,
  font_size VARCHAR(10) DEFAULT 'medium',
  color_scheme VARCHAR(20) DEFAULT 'default',
  performance_mode VARCHAR(20) DEFAULT 'optimized'
);
```

### 12.3. ML Agent Tables

```sql
CREATE TABLE public.ml_learning_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_type VARCHAR(50) NOT NULL,
  pattern_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.user_interaction_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  profile_data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

---

## 13. Setup and Deployment

### 13.1. Environment Configuration

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# DeepSeek API Configuration
DEEPSEEK_API_KEY=your_deepseek_api_key

# Optional: ML Agent Configuration
ML_AGENT_ENABLED=true
ML_AGENT_TRAINING_INTERVAL_HOURS=6
ML_AGENT_MIN_ARTICLES_FOR_TRAINING=50
ML_AGENT_CONFIDENCE_THRESHOLD=0.7
```

### 13.2. Database Setup

```bash
# Set up database schema
npm run setup:database

# Set up ML agent system
npm run setup:ml-agent

# Test the system
npm run test:integration
```

### 13.3. Deployment Options

**Web Application Deployment:**
```bash
# Build for production
npm run build

# Deploy to various platforms
# Vercel
vercel --prod

# Netlify
netlify deploy --prod --dir=dist

# AWS S3
aws s3 sync dist/ s3://your-bucket --delete

# Any static hosting service
# Upload dist/ folder contents to your hosting provider
```

**Docker Deployment:**
```bash
# Build Docker image
docker build -t jamstockanalytics .

# Run container
docker run -p 8081:8081 jamstockanalytics

# Using docker-compose
docker-compose up -d
```

---

## 14. Monitoring and Analytics

### 14.1. Performance Metrics

- **Core Web Vitals:** LCP, FID, CLS tracking
- **Bundle Analysis:** Continuous bundle size monitoring
- **User Metrics:** Real user monitoring (RUM)
- **Error Tracking:** Comprehensive error logging

### 14.2. Business Metrics

- **User Engagement:** Daily active users, session duration, articles read per session
- **AI Effectiveness:** User satisfaction with AI responses, analysis session completion rates
- **Content Quality:** AI priority score accuracy, user feedback on news relevance
- **Retention:** Weekly and monthly user retention rates

### 14.3. ML Agent Metrics

- **Learning Patterns Count** → Number of active patterns
- **User Profiles Count** → Number of user profiles built
- **Curation Accuracy** → How well predictions match actual engagement
- **Training Frequency** → How often the model retrains
- **Pattern Success Rate** → Success rate of learned patterns

---

## 15. Documentation and Support

### 15.1. Available Documentation

- **API Documentation** - Complete API reference
- **Deployment Guide** - Step-by-step deployment instructions
- **Contributing Guidelines** - How to contribute to the project
- **Troubleshooting Guide** - Common issues and solutions

### 15.2. Support Resources

- Test scripts for verification
- Error logging and monitoring
- User feedback collection
- Performance optimization guidelines

---

## 16. GitHub Error Resolution Documentation

### 16.1. Common GitHub Issues and Solutions

#### Issue: "Fix errors and configure HTML deployment"
**Symptoms:**
- GitHub shows "Fix errors and configure HTML deployment" in repository status
- HTML deployment appears to be working but GitHub still reports issues
- Repository has multiple branches with different configurations

**Root Cause:**
- GitHub's status checks are based on the default branch (usually `master` or `main`)
- If the `gh-pages` branch has the correct configuration but the default branch doesn't, GitHub will still report issues
- Branch synchronization problems between `master` and `gh-pages`

**Solution:**
1. **Check Branch Status:**
   ```bash
   git branch -a
   git status
   ```

2. **Switch to Default Branch:**
   ```bash
   git checkout master
   # or
   git checkout main
   ```

3. **Merge gh-pages into Default Branch:**
   ```bash
   git merge gh-pages
   ```

4. **Push Changes:**
   ```bash
   git push origin master
   ```

5. **Verify Resolution:**
   - Check GitHub repository status
   - Verify HTML deployment is working
   - Confirm all branches are synchronized

#### Issue: GitHub Actions Workflow Failures
**Symptoms:**
- Workflows fail with syntax errors
- Conditional logic not working properly
- Missing environment variables

**Common Fixes:**
1. **Fix YAML Syntax:**
   ```yaml
   # Correct conditional syntax
   if: ${{ secrets.EXPO_TOKEN != '' }}
   
   # Incorrect syntax
   if: ${{ secrets.EXPO_TOKEN }}
   ```

2. **Fix PowerShell Syntax:**
   ```powershell
   # Correct string formatting
   Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
   
   # Incorrect syntax
   Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
   ```

3. **Fix Docker Workflow Issues:**
   ```yaml
   # Correct metadata extraction
   - name: Extract metadata
     id: meta
     uses: docker/metadata-action@v5
     with:
       images: jamstockanalytics
       tags: |
         type=ref,event=branch
         type=ref,event=pr
         type=sha,prefix={{branch}}-
         type=raw,value=latest,enable={{is_default_branch}}
   ```

#### Issue: HTML Deployment Problems
**Symptoms:**
- HTML files not deploying correctly
- Missing static assets
- GitHub Pages not updating

**Solution:**
1. **Create Proper HTML Structure:**
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>JamStockAnalytics</title>
       <link rel="stylesheet" href="static/css/main.css">
   </head>
   <body>
       <!-- Content -->
       <script src="static/js/main.js"></script>
   </body>
   </html>
   ```

2. **Create Static Assets Structure:**
   ```
   static/
   ├── css/
   │   └── main.css
   ├── js/
   │   └── main.js
   └── images/
       └── logo.png
   ```

3. **Configure GitHub Pages:**
   - Go to repository Settings
   - Navigate to Pages section
   - Select source: Deploy from a branch
   - Choose branch: gh-pages
   - Select folder: / (root)

### 16.2. Troubleshooting Steps

#### Step 1: Verify Repository Status
```bash
# Check current branch
git branch

# Check status
git status

# Check remote branches
git branch -a
```

#### Step 2: Check GitHub Actions
1. Go to repository Actions tab
2. Check workflow runs
3. Review failed jobs
4. Check logs for specific errors

#### Step 3: Verify HTML Configuration
1. Check if `index.html` exists in root
2. Verify static assets are present
3. Test HTML locally
4. Check GitHub Pages settings

#### Step 4: Branch Synchronization
```bash
# Switch to default branch
git checkout master

# Merge gh-pages
git merge gh-pages

# Push changes
git push origin master
```

### 16.3. Prevention Strategies

#### 1. Consistent Branch Management
- Always work on the default branch for main development
- Use `gh-pages` only for deployment
- Regularly sync branches

#### 2. Proper Workflow Configuration
- Use correct YAML syntax
- Test workflows locally
- Validate environment variables

#### 3. HTML Deployment Best Practices
- Keep HTML files in root directory
- Use relative paths for assets
- Test deployment locally first

#### 4. Regular Maintenance
- Monitor GitHub status regularly
- Check for workflow failures
- Update dependencies regularly

### 16.4. Emergency Recovery

#### If Repository is Completely Broken:
1. **Backup Current State:**
   ```bash
   git stash
   git branch backup-$(date +%Y%m%d)
   ```

2. **Reset to Working State:**
   ```bash
   git reset --hard HEAD~1
   # or
   git reset --hard <commit-hash>
   ```

3. **Force Push (Use with Caution):**
   ```bash
   git push --force origin master
   ```

#### If GitHub Pages is Not Working:
1. **Check Settings:**
   - Repository Settings → Pages
   - Verify source branch
   - Check folder selection

2. **Re-deploy:**
   ```bash
   git checkout gh-pages
   git push origin gh-pages
   ```

3. **Wait for Deployment:**
   - GitHub Pages can take 5-10 minutes to update
   - Check Actions tab for deployment status

### 16.5. Monitoring and Alerts

#### Set Up Monitoring:
1. **GitHub Notifications:**
   - Enable email notifications for workflow failures
   - Set up branch protection rules

2. **External Monitoring:**
   - Use services like UptimeRobot
   - Monitor website availability
   - Check deployment status

3. **Regular Health Checks:**
   - Weekly repository status review
   - Monthly workflow audit
   - Quarterly dependency updates

---

## 17. GitHub Error Resolution Documentation

### 17.1. Common GitHub Issues and Solutions

#### Issue: "Fix errors and configure HTML deployment"
**Symptoms:**
- GitHub shows "Fix errors and configure HTML deployment" in repository status
- HTML deployment appears to be working but GitHub still reports issues
- Repository has multiple branches with different configurations

**Root Cause:**
- GitHub's status checks are based on the default branch (usually `master` or `main`)
- If the `gh-pages` branch has the correct configuration but the default branch doesn't, GitHub will still report issues
- Branch synchronization problems between `master` and `gh-pages`

**Solution:**
1. **Check Branch Status:**
   ```bash
   git branch -a
   git status
   ```

2. **Switch to Default Branch:**
   ```bash
   git checkout master
   # or
   git checkout main
   ```

3. **Merge gh-pages into Default Branch:**
   ```bash
   git merge gh-pages
   ```

4. **Push Changes:**
   ```bash
   git push origin master
   ```

5. **Verify Resolution:**
   - Check GitHub repository status
   - Verify HTML deployment is working
   - Confirm all branches are synchronized

#### Issue: GitHub Actions Workflow Failures
**Symptoms:**
- Workflows fail with syntax errors
- Conditional logic not working properly
- Missing environment variables
- Docker build failures

**Common Fixes:**

1. **Fix YAML Syntax:**
   ```yaml
   # ✅ Correct conditional syntax
   if: ${{ secrets.EXPO_TOKEN != '' }}
   
   # ❌ Incorrect syntax
   if: ${{ secrets.EXPO_TOKEN }}
   ```

2. **Fix PowerShell Syntax:**
   ```powershell
   # ✅ Correct string formatting
   Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
   
   # ❌ Incorrect syntax
   Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
   ```

3. **Fix Docker Workflow Issues:**
   ```yaml
   # ✅ Correct metadata extraction
   - name: Extract metadata
     id: meta
     uses: docker/metadata-action@v5
     with:
       images: jamstockanalytics
       tags: |
         type=ref,event=branch
         type=ref,event=pr
         type=sha,prefix={{branch}}-
         type=raw,value=latest,enable={{is_default_branch}}
   ```

#### Issue: HTML Deployment Problems
**Symptoms:**
- HTML files not deploying correctly
- Missing static assets
- GitHub Pages not updating
- 404 errors on deployed site

**Solution:**

1. **Create Proper HTML Structure:**
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>JamStockAnalytics</title>
       <link rel="stylesheet" href="static/css/main.css">
   </head>
   <body>
       <!-- Content -->
       <script src="static/js/main.js"></script>
   </body>
   </html>
   ```

2. **Create Static Assets Structure:**
   ```
   static/
   ├── css/
   │   └── main.css
   ├── js/
   │   └── main.js
   └── images/
       └── logo.png
   ```

3. **Configure GitHub Pages:**
   - Go to repository Settings
   - Navigate to Pages section
   - Select source: Deploy from a branch
   - Choose branch: gh-pages
   - Select folder: / (root)

#### Issue: Branch Protection Issues
**Symptoms:**
- Cannot push to protected branches
- Workflow failures due to branch protection
- Merge conflicts

**Solution:**
```bash
# Check branch protection rules
git config --get branch.master.protection

# Temporarily disable protection (if you have admin access)
# Go to repository Settings → Branches → Edit protection rules

# Force push (use with caution)
git push --force-with-lease origin master
```

#### Issue: Environment Variables Issues
**Symptoms:**
- Workflows fail with "secrets not found"
- API keys not working
- Authentication failures

**Solution:**
1. Go to repository Settings → Secrets and variables → Actions
2. Add required secrets:
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`
   - `EXPO_TOKEN`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### 17.2. Troubleshooting Steps

#### Step 1: Verify Repository Status
```bash
# Check current branch
git branch

# Check status
git status

# Check remote branches
git branch -a

# Check last commit
git log --oneline -5
```

#### Step 2: Check GitHub Actions
1. Go to repository Actions tab
2. Check workflow runs
3. Review failed jobs
4. Check logs for specific errors
5. Verify environment variables

#### Step 3: Verify HTML Configuration
1. Check if `index.html` exists in root
2. Verify static assets are present
3. Test HTML locally
4. Check GitHub Pages settings

#### Step 4: Branch Synchronization
```bash
# Switch to default branch
git checkout master

# Merge gh-pages
git merge gh-pages

# Push changes
git push origin master

# Verify both branches
git checkout gh-pages
git log --oneline -3
git checkout master
git log --oneline -3
```

#### Step 5: Test Deployment
```bash
# Test HTML locally
python -m http.server 8000
# or
npx serve .

# Test Docker locally
docker build -t jamstockanalytics .
docker run -p 8081:8081 jamstockanalytics
```

### 17.3. Prevention Strategies

#### 1. Consistent Branch Management
- Always work on the default branch for main development
- Use `gh-pages` only for deployment
- Regularly sync branches
- Use feature branches for development

#### 2. Proper Workflow Configuration
- Use correct YAML syntax
- Test workflows locally
- Validate environment variables
- Use proper conditional logic

#### 3. HTML Deployment Best Practices
- Keep HTML files in root directory
- Use relative paths for assets
- Test deployment locally first
- Use proper meta tags

#### 4. Regular Maintenance
- Monitor GitHub status regularly
- Check for workflow failures
- Update dependencies regularly
- Review and update documentation

#### 5. Code Quality
- Use linting tools
- Write comprehensive tests
- Use proper error handling
- Document all changes

### 17.4. Emergency Recovery

#### If Repository is Completely Broken:

1. **Backup Current State:**
   ```bash
   # Create backup branch
   git stash
   git branch backup-$(date +%Y%m%d)
   
   # Save current state
   git add .
   git commit -m "Emergency backup before recovery"
   ```

2. **Reset to Working State:**
   ```bash
   # Reset to previous commit
   git reset --hard HEAD~1
   
   # Or reset to specific commit
   git reset --hard <commit-hash>
   
   # Force push (use with caution)
   git push --force-with-lease origin master
   ```

3. **Recreate from Scratch:**
   ```bash
   # Clone fresh repository
   git clone https://github.com/username/repository.git
   cd repository
   
   # Copy working files
   cp -r /path/to/working/files/* .
   
   # Commit and push
   git add .
   git commit -m "Recovery: Restore working state"
   git push origin master
   ```

#### If GitHub Pages is Not Working:

1. **Check Settings:**
   - Repository Settings → Pages
   - Verify source branch
   - Check folder selection
   - Confirm custom domain (if used)

2. **Re-deploy:**
   ```bash
   # Switch to gh-pages branch
   git checkout gh-pages
   
   # Force update
   git push origin gh-pages --force
   
   # Switch back to master
   git checkout master
   ```

3. **Wait for Deployment:**
   - GitHub Pages can take 5-10 minutes to update
   - Check Actions tab for deployment status
   - Verify site is accessible

#### If Docker Builds Fail:

1. **Check Dockerfile:**
   ```dockerfile
   # Ensure proper base image
   FROM node:18-alpine
   
   # Set working directory
   WORKDIR /app
   
   # Copy package files
   COPY package*.json ./
   
   # Install dependencies
   RUN npm ci --only=production
   
   # Copy source code
   COPY . .
   
   # Expose port
   EXPOSE 8081
   
   # Start application
   CMD ["npm", "start"]
   ```

2. **Test Locally:**
   ```bash
   # Build image
   docker build -t jamstockanalytics .
   
   # Run container
   docker run -p 8081:8081 jamstockanalytics
   
   # Check logs
   docker logs <container-id>
   ```

### 17.5. Monitoring & Alerts

#### Set Up Monitoring:

1. **GitHub Notifications:**
   - Enable email notifications for workflow failures
   - Set up branch protection rules
   - Configure status checks

2. **External Monitoring:**
   - Use services like UptimeRobot
   - Monitor website availability
   - Check deployment status
   - Set up alerts for downtime

3. **Regular Health Checks:**
   - Weekly repository status review
   - Monthly workflow audit
   - Quarterly dependency updates
   - Annual security review

#### Monitoring Scripts:

**Repository Health Check:**
```bash
#!/bin/bash
# repository-health-check.sh

echo "🔍 Checking repository health..."

# Check branch status
echo "📊 Branch status:"
git branch -a

# Check last commit
echo "📝 Last commit:"
git log --oneline -1

# Check remote status
echo "🌐 Remote status:"
git remote -v

# Check for uncommitted changes
echo "📋 Working directory status:"
git status --porcelain

echo "✅ Repository health check complete"
```

**Workflow Status Check:**
```bash
#!/bin/bash
# workflow-status-check.sh

echo "🔍 Checking workflow status..."

# Check recent workflow runs
gh run list --limit 10

# Check failed runs
gh run list --status failure --limit 5

# Check current status
gh run list --status in_progress

echo "✅ Workflow status check complete"
```

### 17.6. Best Practices

#### 1. Repository Management
- Keep branches synchronized
- Use meaningful commit messages
- Regular backups
- Proper documentation

#### 2. Workflow Design
- Test workflows locally
- Use proper error handling
- Implement rollback strategies
- Monitor performance

#### 3. Security
- Use secrets for sensitive data
- Regular security audits
- Update dependencies
- Implement proper access controls

#### 4. Documentation
- Keep documentation updated
- Document all changes
- Provide troubleshooting guides
- Include examples

#### 5. Testing
- Test all changes locally
- Use staging environments
- Implement automated testing
- Regular health checks

### 17.7. Support Resources

#### Repository Links
- **Main Repository:** https://github.com/jamstockanalytics-oss/JamstockAnalyticsWebOnly
- **Master Branch:** https://github.com/jamstockanalytics-oss/JamstockAnalyticsWebOnly/tree/master
- **gh-pages Branch:** https://github.com/jamstockanalytics-oss/JamstockAnalyticsWebOnly/tree/gh-pages
- **Actions:** https://github.com/jamstockanalytics-oss/JamstockAnalyticsWebOnly/actions

#### Live Site
- **Main Site:** https://jamstockanalytics-oss.github.io/JamstockAnalyticsWebOnly/
- **Config Page:** https://jamstockanalytics-oss.github.io/JamstockAnalyticsWebOnly/web-config.html
- **Preview Page:** https://jamstockanalytics-oss.github.io/JamstockAnalyticsWebOnly/web-preview.html

#### Documentation
- **API Documentation:** [Link to API docs]
- **Deployment Guide:** [Link to deployment guide]
- **Contributing Guidelines:** [Link to contributing guide]
- **Troubleshooting Guide:** This document

### 17.8. Success Metrics

#### Repository Health
- ✅ No GitHub errors
- ✅ All workflows passing
- ✅ Branches synchronized
- ✅ Documentation updated

#### Deployment Status
- ✅ HTML deployment working
- ✅ Docker builds successful
- ✅ GitHub Pages live
- ✅ All features functional

#### Monitoring
- ✅ Health checks passing
- ✅ Alerts configured
- ✅ Regular maintenance
- ✅ Performance optimized

---

*This document serves as the comprehensive specification for the JamStockAnalyticsAI application, covering all aspects from initial setup to advanced features and deployment, including comprehensive GitHub error resolution documentation.*