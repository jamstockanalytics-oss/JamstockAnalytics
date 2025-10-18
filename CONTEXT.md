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
# Build Docker image (lightweight nginx-based)
docker build -t jamstockanalytics .

# Run container (serves web application on port 80, accessible via localhost:8081)
docker run -p 8081:80 jamstockanalytics

# Using docker-compose (updated for nginx)
docker-compose up -d
```

**Alternative: Python HTTP Server Deployment:**
```bash
# Build Docker image (Python-based alternative)
docker build -f Dockerfile.python -t jamstockanalytics-python .

# Run container (serves web application on port 8081)
docker run -p 8081:8081 jamstockanalytics-python

# Using docker-compose with Python alternative
docker-compose -f docker-compose.python.yml up -d
```

**Complete nginx Dockerfile (Dockerfile):**
```dockerfile
# Use nginx Alpine for lightweight static file serving
FROM nginx:alpine

# Add metadata
LABEL maintainer="JamStockAnalytics Team"
LABEL description="JamStockAnalytics Web Application"
LABEL version="1.0.0"

# Create non-root user for security
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy web application files with proper ownership
COPY --chown=nginx:nginx index.html ./
COPY --chown=nginx:nginx web-config.html ./
COPY --chown=nginx:nginx web-preview.html ./
COPY --chown=nginx:nginx static/ ./static/
COPY --chown=nginx:nginx logo.png ./
COPY --chown=nginx:nginx favicon.ico ./
COPY --chown=nginx:nginx *.html ./

# Create nginx configuration for optimization
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    ' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Security headers' >> /etc/nginx/conf.d/default.conf && \
    echo '    add_header X-Frame-Options "SAMEORIGIN" always;' >> /etc/nginx/conf.d/default.conf && \
    echo '    add_header X-Content-Type-Options "nosniff" always;' >> /etc/nginx/conf.d/default.conf && \
    echo '    add_header X-XSS-Protection "1; mode=block" always;' >> /etc/nginx/conf.d/default.conf && \
    echo '    ' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Gzip compression' >> /etc/nginx/conf.d/default.conf && \
    echo '    gzip on;' >> /etc/nginx/conf.d/default.conf && \
    echo '    gzip_vary on;' >> /etc/nginx/conf.d/default.conf && \
    echo '    gzip_min_length 1024;' >> /etc/nginx/conf.d/default.conf && \
    echo '    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;' >> /etc/nginx/conf.d/default.conf && \
    echo '    ' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Cache static assets' >> /etc/nginx/conf.d/default.conf && \
    echo '    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {' >> /etc/nginx/conf.d/default.conf && \
    echo '        expires 1y;' >> /etc/nginx/conf.d/default.conf && \
    echo '        add_header Cache-Control "public, immutable";' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '    ' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Main location' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Expose port 80
EXPOSE 80

# Nginx starts automatically
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml Configuration:**
```yaml
version: '3.8'

services:
  jamstockanalytics:
    build: .
    ports:
      - "8081:80"
    volumes:
      - ./static:/usr/share/nginx/html/static:ro
      - ./index.html:/usr/share/nginx/html/index.html:ro
      - ./web-config.html:/usr/share/nginx/html/web-config.html:ro
      - ./web-preview.html:/usr/share/nginx/html/web-preview.html:ro
      - ./logo.png:/usr/share/nginx/html/logo.png:ro
      - ./favicon.ico:/usr/share/nginx/html/favicon.ico:ro
```

**Complete Python HTTP Server Dockerfile (Dockerfile.python):**
```dockerfile
# Use Python 3.11 Alpine for lightweight static file serving
FROM python:3.11-alpine

# Add metadata
LABEL maintainer="JamStockAnalytics Team"
LABEL description="JamStockAnalytics Web Application (Python HTTP Server)"
LABEL version="1.0.0"

# Install required packages for security and functionality
RUN apk add --no-cache \
    wget \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G appgroup -g appgroup appuser

# Set working directory
WORKDIR /app

# Copy all web application files with proper ownership
COPY --chown=appuser:appgroup index.html ./
COPY --chown=appuser:appgroup web-config.html ./
COPY --chown=appuser:appgroup web-preview.html ./
COPY --chown=appuser:appgroup static/ ./static/
COPY --chown=appuser:appgroup logo.png ./
COPY --chown=appuser:appgroup favicon.ico ./
COPY --chown=appuser:appgroup *.html ./

# Create a custom HTTP server script for better control
RUN echo '#!/usr/bin/env python3' > /app/server.py && \
    echo 'import http.server' >> /app/server.py && \
    echo 'import socketserver' >> /app/server.py && \
    echo 'import os' >> /app/server.py && \
    echo 'import sys' >> /app/server.py && \
    echo 'import signal' >> /app/server.py && \
    echo '' >> /app/server.py && \
    echo 'class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):' >> /app/server.py && \
    echo '    def end_headers(self):' >> /app/server.py && \
    echo '        # Add security headers' >> /app/server.py && \
    echo '        self.send_header("X-Frame-Options", "SAMEORIGIN")' >> /app/server.py && \
    echo '        self.send_header("X-Content-Type-Options", "nosniff")' >> /app/server.py && \
    echo '        self.send_header("X-XSS-Protection", "1; mode=block")' >> /app/server.py && \
    echo '        self.send_header("Cache-Control", "public, max-age=3600")' >> /app/server.py && \
    echo '        super().end_headers()' >> /app/server.py && \
    echo '' >> /app/server.py && \
    echo '    def log_message(self, format, *args):' >> /app/server.py && \
    echo '        # Custom logging format' >> /app/server.py && \
    echo '        sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\\n")' >> /app/server.py && \
    echo '' >> /app/server.py && \
    echo 'def signal_handler(sig, frame):' >> /app/server.py && \
    echo '    print("\\nShutting down server...")' >> /app/server.py && \
    echo '    sys.exit(0)' >> /app/server.py && \
    echo '' >> /app/server.py && \
    echo 'if __name__ == "__main__":' >> /app/server.py && \
    echo '    PORT = int(os.environ.get("PORT", 8081))' >> /app/server.py && \
    echo '    ' >> /app/server.py && \
    echo '    # Set up signal handlers for graceful shutdown' >> /app/server.py && \
    echo '    signal.signal(signal.SIGINT, signal_handler)' >> /app/server.py && \
    echo '    signal.signal(signal.SIGTERM, signal_handler)' >> /app/server.py && \
    echo '    ' >> /app/server.py && \
    echo '    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:' >> /app/server.py && \
    echo '        print(f"Server running on port {PORT}")' >> /app/server.py && \
    echo '        httpd.serve_forever()' >> /app/server.py

# Make the server script executable
RUN chmod +x /app/server.py

# Set proper permissions
RUN chown -R appuser:appgroup /app && \
    chmod -R 755 /app

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8081/ || exit 1

# Expose port 8081
EXPOSE 8081

# Start custom Python HTTP server
CMD ["python3", "/app/server.py"]
```

**Dockerfile Usage Examples:**

**Build and Run nginx Version:**
```bash
# Build nginx-based image
docker build -t jamstockanalytics-nginx .

# Run nginx container
docker run -d -p 8081:80 --name jamstock-nginx jamstockanalytics-nginx

# Check container status
docker ps
docker logs jamstock-nginx

# Test the application
curl http://localhost:8081
```

**Build and Run Python Version:**
```bash
# Build Python-based image
docker build -f Dockerfile.python -t jamstockanalytics-python .

# Run Python container
docker run -d -p 8081:8081 --name jamstock-python jamstockanalytics-python

# Check container status
docker ps
docker logs jamstock-python

# Test the application
curl http://localhost:8081
```

**Production Deployment Commands:**
```bash
# nginx Production Deployment
docker build -t jamstockanalytics:latest .
docker tag jamstockanalytics:latest your-registry/jamstockanalytics:latest
docker push your-registry/jamstockanalytics:latest

# Python Production Deployment
docker build -f Dockerfile.python -t jamstockanalytics-python:latest .
docker tag jamstockanalytics-python:latest your-registry/jamstockanalytics-python:latest
docker push your-registry/jamstockanalytics-python:latest
```

**Dockerfile Feature Comparison:**

| Feature | nginx Dockerfile | Python Dockerfile |
|---------|------------------|-------------------|
| **Base Image** | nginx:alpine (~15MB) | python:3.11-alpine (~50MB) |
| **Security** | Non-root user, security headers | Non-root user, custom headers |
| **Performance** | Optimized for static files | General-purpose HTTP server |
| **Caching** | Built-in nginx caching | Custom cache headers |
| **Compression** | Built-in gzip compression | Basic HTTP server |
| **Health Checks** | wget-based health check | wget-based health check |
| **Production Ready** | ✅ Highly optimized | ✅ Good for development |
| **Customization** | nginx configuration | Custom Python server script |
| **Resource Usage** | Very low CPU/memory | Moderate CPU/memory |
| **Scalability** | Excellent for high traffic | Limited concurrent connections |

**Alternative: Python docker-compose.yml (docker-compose.python.yml):**
```yaml
version: '3.8'

services:
  jamstockanalytics-python:
    build:
      context: .
      dockerfile: Dockerfile.python
    ports:
      - "8081:8081"
    volumes:
      - ./static:/app/static:ro
      - ./index.html:/app/index.html:ro
      - ./web-config.html:/app/web-config.html:ro
      - ./web-preview.html:/app/web-preview.html:ro
      - ./logo.png:/app/logo.png:ro
      - ./favicon.ico:/app/favicon.ico:ro
      - ./*.html:/app/:ro
```

**Benefits of nginx-based Docker setup:**
- ✅ **Lightweight:** nginx Alpine image is much smaller than Node.js
- ✅ **Fast Build:** No npm dependencies or complex build processes
- ✅ **Reliable:** nginx is production-ready and battle-tested
- ✅ **Static Files:** Perfect for serving HTML, CSS, and JavaScript
- ✅ **Performance:** nginx is optimized for static content delivery
- ✅ **Security:** Minimal attack surface with Alpine Linux

**Detailed Comparison: nginx vs Node.js/npm Approach**

| Aspect | nginx Alpine | Node.js/npm |
|--------|--------------|-------------|
| **Image Size** | ~15MB | ~100-200MB+ |
| **Build Time** | 10-30 seconds | 2-5 minutes |
| **Memory Usage** | 5-10MB | 50-100MB+ |
| **Dependencies** | None | package.json + node_modules |
| **Security** | Minimal attack surface | Larger attack surface |
| **Performance** | Optimized for static files | General-purpose runtime |
| **Reliability** | Battle-tested web server | Application server |
| **Maintenance** | Minimal updates needed | Regular dependency updates |
| **Startup Time** | Instant | 1-3 seconds |
| **Resource Usage** | Very low CPU/memory | Higher resource consumption |

**Why nginx is Superior for Static Web Applications:**

1. **Resource Efficiency:**
   - nginx uses ~90% less memory than Node.js
   - Faster startup and response times
   - Lower CPU usage for static file serving

2. **Build Process:**
   - No `npm install` required (saves 2-5 minutes per build)
   - No dependency vulnerabilities to manage
   - No package-lock.json conflicts

3. **Production Readiness:**
   - nginx is designed specifically for web serving
   - Built-in caching, compression, and security features
   - Handles thousands of concurrent connections efficiently

4. **Maintenance:**
   - Fewer moving parts = fewer things to break
   - No dependency updates or security patches for npm packages
   - Simpler deployment and rollback procedures

5. **Cost Benefits:**
   - Smaller Docker images = faster deployments
   - Lower resource usage = lower hosting costs
   - Reduced bandwidth for image transfers

**When to Use Python HTTP Server Alternative:**

✅ **Use Python HTTP Server when:**
- nginx configuration is complex for your environment
- You need simple debugging and logging
- Development/testing environments
- Minimal Docker knowledge required
- Quick prototyping

✅ **Use nginx when:**
- Production deployments
- High performance requirements
- Security is critical
- Need advanced features (caching, compression, etc.)
- Scalability is important

**Python HTTP Server Benefits:**
- ✅ **Simple Setup:** No configuration files needed
- ✅ **Easy Debugging:** Clear Python error messages
- ✅ **Development Friendly:** Easy to modify and test
- ✅ **Minimal Dependencies:** Just Python standard library
- ✅ **Quick Start:** Faster for development iterations

**Python HTTP Server Limitations:**
- ❌ **Performance:** Slower than nginx for high traffic
- ❌ **Features:** No built-in caching, compression, or security features
- ❌ **Production:** Not recommended for production workloads
- ❌ **Concurrency:** Limited concurrent connection handling

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
docker run -p 8081:80 jamstockanalytics
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

1. **Use Simplified nginx Dockerfile:**
   ```dockerfile
   # Use nginx Alpine for lightweight static file serving
   FROM nginx:alpine
   
   # Copy web application files
   COPY index.html /usr/share/nginx/html/
   COPY web-config.html /usr/share/nginx/html/
   COPY web-preview.html /usr/share/nginx/html/
   COPY static/ /usr/share/nginx/html/static/
   COPY logo.png /usr/share/nginx/html/
   COPY favicon.ico /usr/share/nginx/html/
   COPY *.html /usr/share/nginx/html/
   
   # Expose port 80
   EXPOSE 80
   
   # Nginx starts automatically
   ```

2. **Test Locally:**
   ```bash
   # Build image (much faster with nginx)
   docker build -t jamstockanalytics .
   
   # Run container
   docker run -p 8081:80 jamstockanalytics
   
   # Check logs
   docker logs <container-id>
   ```

3. **Alternative: Python HTTP Server (if nginx issues):**
   ```dockerfile
   # Use Python 3.11 Alpine for lightweight static file serving
   FROM python:3.11-alpine
   
   # Set working directory
   WORKDIR /app
   
   # Copy all web application files
   COPY index.html .
   COPY web-config.html .
   COPY web-preview.html .
   COPY static/ ./static/
   COPY logo.png .
   COPY favicon.ico .
   COPY *.html .
   
   # Expose port 8081
   EXPOSE 8081
   
   # Start Python HTTP server
   CMD ["python", "-m", "http.server", "8081"]
   ```

### 17.6. Comprehensive Docker Troubleshooting

#### Docker Build Issues

**Issue: Docker Build Context Errors**
**Symptoms:**
- `COPY failed: file not found` errors
- `no such file or directory` during build
- Build context issues with file paths

**Root Cause:**
- Missing files in build context
- Incorrect file paths in Dockerfile
- .dockerignore excluding necessary files

**Solution:**
```bash
# Check build context
docker build --no-cache -t jamstockanalytics .

# Verify files exist
ls -la index.html web-config.html static/
ls -la logo.png favicon.ico

# Check .dockerignore
cat .dockerignore

# Build with verbose output
docker build --progress=plain -t jamstockanalytics .
```

**Issue: Docker Image Size Problems**
**Symptoms:**
- Large image sizes (>500MB)
- Slow build times
- Registry push failures

**Solution:**
```bash
# Use multi-stage builds
FROM nginx:alpine AS builder
# ... build steps ...
FROM nginx:alpine
COPY --from=builder /app /usr/share/nginx/html

# Optimize image size
docker images jamstockanalytics
docker history jamstockanalytics

# Use .dockerignore
echo "node_modules" >> .dockerignore
echo ".git" >> .dockerignore
echo "*.md" >> .dockerignore
```

#### Docker Runtime Issues

**Issue: Container Won't Start**
**Symptoms:**
- `docker run` fails immediately
- Container exits with code 1
- Port binding errors

**Diagnosis:**
```bash
# Check container logs
docker logs <container-id>

# Run with interactive mode
docker run -it jamstockanalytics /bin/sh

# Check port conflicts
netstat -tulpn | grep :8081
lsof -i :8081

# Test nginx configuration
docker run -it jamstockanalytics nginx -t
```

**Solution:**
```bash
# Kill conflicting processes
sudo kill -9 $(lsof -t -i:8081)

# Use different port
docker run -p 8082:80 jamstockanalytics

# Check nginx status
docker exec <container-id> nginx -s reload
```

**Issue: Static Files Not Loading**
**Symptoms:**
- 404 errors for CSS/JS files
- Broken images
- Missing static assets

**Diagnosis:**
```bash
# Check file permissions
docker exec <container-id> ls -la /usr/share/nginx/html/

# Test file access
docker exec <container-id> cat /usr/share/nginx/html/index.html

# Check nginx error logs
docker exec <container-id> cat /var/log/nginx/error.log
```

**Solution:**
```bash
# Fix file permissions
docker exec <container-id> chmod -R 755 /usr/share/nginx/html/

# Restart nginx
docker exec <container-id> nginx -s reload

# Rebuild with correct paths
docker build --no-cache -t jamstockanalytics .
```

#### Docker Compose Issues

**Issue: Docker Compose Failures**
**Symptoms:**
- `docker-compose up` fails
- Volume mount errors
- Service dependency issues

**Diagnosis:**
```bash
# Check compose file syntax
docker-compose config

# Validate services
docker-compose config --services

# Check for port conflicts
docker-compose ps
```

**Solution:**
```bash
# Recreate containers
docker-compose down
docker-compose up --force-recreate

# Check volume mounts
docker-compose exec jamstockanalytics ls -la /usr/share/nginx/html/

# Debug with logs
docker-compose logs jamstockanalytics
```

#### GitHub Actions Docker Issues

**Issue: GitHub Actions Docker Build Failures**
**Symptoms:**
- Workflow fails on Docker build step
- Registry authentication errors
- Build timeout issues

**Common Fixes:**

1. **Fix Docker Build Context:**
```yaml
- name: Build Docker image
  run: |
    # Ensure all files are present
    ls -la
    ls -la static/
    
    # Build with proper context
    docker build -t jamstockanalytics .
```

2. **Fix Registry Authentication:**
```yaml
- name: Login to Docker Hub
  uses: docker/login-action@v2
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}

- name: Build and push
  uses: docker/build-push-action@v4
  with:
    context: .
    push: true
    tags: jamstockanalytics:latest
```

3. **Fix Build Timeout:**
```yaml
- name: Build with timeout
  run: |
    timeout 300 docker build -t jamstockanalytics .
```

**Issue: Docker Registry Push Failures**
**Symptoms:**
- `denied: requested access to the resource is denied`
- Authentication failures
- Tag naming issues

**Solution:**
```bash
# Check authentication
docker login

# Verify tags
docker images jamstockanalytics

# Test push locally
docker push jamstockanalytics:latest

# Use proper naming
docker tag jamstockanalytics username/jamstockanalytics:latest
docker push username/jamstockanalytics:latest
```

#### Advanced Docker Troubleshooting

**Docker System Diagnostics:**
```bash
# System information
docker system df
docker system info

# Container resource usage
docker stats

# Network debugging
docker network ls
docker network inspect bridge

# Volume debugging
docker volume ls
docker volume inspect <volume-name>
```

**Performance Optimization:**
```bash
# Clean up unused resources
docker system prune -a

# Optimize build cache
docker build --no-cache -t jamstockanalytics .

# Use buildkit for faster builds
DOCKER_BUILDKIT=1 docker build -t jamstockanalytics .
```

**Security Best Practices:**
```bash
# Scan for vulnerabilities
docker scan jamstockanalytics

# Use non-root user
FROM nginx:alpine
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx
USER nginx

# Minimal base image
FROM nginx:alpine
# Remove unnecessary packages
RUN apk del --no-cache <unnecessary-packages>
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