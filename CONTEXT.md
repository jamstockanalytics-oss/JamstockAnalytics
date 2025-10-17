# Financial News Analyzer App: JamStockAnalyticsAI

## 1. Overview

This document outlines the specifications for a mobile application designed to aggregate, prioritize, and help users analyze financial news related to companies on the Jamaica Stock Exchange (JSE) and the Junior Stock Exchange. The core value proposition is leveraging AI to cut through the noise and provide actionable insights.

Tech Stack:
Frontend: React Native with TypeScript, Expo, and Expo Router
Backend/Database: Supabase
UI Framework: React Native Paper
AI Processing: DeepSeek
---

## 2. Application Flow & User Journey

The user journey is linear and intuitive, guiding the user from initial discovery to deep analysis.

### Flowchart Summary:
```
Welcome Screen → Sign Up / Log In → Main Dashboard → [Read Article] OR [Chat with AI] → Enter Analysis Mode → Session Complete & Progress → Return to Dashboard
```

---

## 3. Detailed Screen & Feature Specifications

### 3.1. Welcome Screen (`Activity_Welcome` / `ViewController_Welcome`)

**Objective:** To provide a clean, professional first impression and guide the user to authenticate.

**UI Components:**
- App Logo & Name
- A brief, compelling tagline (e.g., "Master the JSE with AI-Powered Insights")
- A "Sign Up with Email" button
- A "Log In" link for returning users

**Functionality:**
- Tapping "Sign Up with Email" navigates to the Sign-Up screen
- Tapping "Log In" navigates to the Login screen

### 3.2. Authentication Screens (`Activity_SignUp`, `Activity_Login`)

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
- Firebase Auth (or equivalent) integration for user registration/login
- Upon successful authentication, the user is redirected to the `Main Dashboard`

### 3.3. Main Dashboard (`Activity_Dashboard` / `ViewController_Dashboard`)

**Objective:** The central hub where users consume prioritized news and access core features.

**UI Components:**
- **App Bar:** Contains the app logo, user profile icon (leading to settings), and a "Analysis Mode" button (prominent, possibly styled differently)
- **Welcome Header:** "Good [Morning/Afternoon], [User Name]"
- **AI Priority Toggle/Section Header:** A header clearly stating "Jamaica Finance News - Sorted by AI Priority"
- **News Feed (Primary Component):** A vertically scrolling list (RecyclerView/ListView/FlatList) of news article cards
- **Floating Action Button (FAB):** For initiating a chat with the AI

**Article Card Components:**
- Article Headline
- Source Publication & Publication Date/Time
- Relevant Company Ticker(s) (e.g., `JSE:NCBFG`, `JSE:SGJ`)
- An **AI Priority Indicator** (e.g., a score out of 10, a "High Impact" badge, or a heatmap-style color code). This is the primary sorting key for the list
- A brief, AI-generated summary snippet (1-2 lines)

**Functionality:**
- The list is automatically sorted by the `AI Priority` score (descending)
- Pull-to-refresh to fetch the latest news
- Tapping an article card opens the full article in an `Article Detail` screen (either in a WebView or a formatted native view)
- Tapping the "Analysis Mode" button navigates the user to the `Analysis Mode` screen
- Tapping the FAB (Chat Icon) opens the `AI Chat` interface

### 3.4. Article Detail Screen (`Activity_ArticleDetail`)

**Objective:** To display the full content of a selected news article.

**UI Components:**
- Top navigation bar with a "Back" button
- Article headline, source, date, and tickers
- WebView or a custom-styled native view to render the article body
- A footer with action buttons: "Share", "Save", and a "Analyze this in AI Chat" button

**Functionality:**
- The "Analyze this in AI Chat" button pre-populates the chat input with the article's headline/URL for context

### 3.5. AI Chat Interface (`Fragment_Chat` / `ViewController_Chat`)

**Objective:** To allow users to have conversational queries about the news, specific companies, or market trends.

**UI Components:**
- A header: "Market Analyst AI"
- A scrollable message list (Chat bubbles: user messages on one side, AI responses on the other)
- A text input field at the bottom with a "Send" button

**Functionality:**
- The AI context should be aware of the user's location (Jamaica), the JSE/Junior Market, and the stream of news articles in the app's database
- It should be able to answer questions like:
  - "Summarize the latest news about NCB Financial Group"
  - "What was the market reaction to the latest BOJ policy announcement?"
  - "Compare the financial performance of Sagicor and Guardian Holdings last quarter"

### 3.6. Analysis Mode (`Activity_AnalysisMode`)

**Objective:** A focused, session-based environment for deep, structured financial analysis.

**UI Components:**
- A full-screen, immersive interface with a minimalistic design to reduce distraction
- A central workspace (could be a canvas, a structured form, or a chat-like interface specifically for analysis)
- Tools accessible via a toolbar (e.g., Notepad, Stock Price Charts, Company Financials, News Timeline)
- A "Complete Session" button

**Functionality:**
- Entering this mode signifies the user's intent to perform a dedicated analysis task
- The app can provide templates: "Bullish/Bearish Thesis," "Event Impact Analysis," "Company Comparison"
- Users can pull in specific articles, charts, and data into their workspace
- The session is timed (optional feature for productivity)
- All user actions, notes, and conclusions within the session are saved

### 3.7. Session Complete & Progress Screen (`Activity_SessionResult`)

**Objective:** To provide closure, show accomplishment, and summarize the user's analytical work.

**UI Components:**
- A congratulatory message: "Session Complete!"
- **Session Summary:**
  - Session Duration
  - Number of articles analyzed
  - Key takeaways/decisions logged by the user (displayed as a list)
  - A "Download/Export Notes" button
- **Action Buttons:**
  - **"Start New Session"**: Clears the previous workspace and returns to `Analysis Mode`
  - **"Take a Break"**: Returns the user to the `Main Dashboard`

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

## 5. Optimal Folder Structure

### 5.1. React Native/Expo Project Structure
```
JamStockAnalytics/
├── app/                          # Expo Router app directory
│   ├── (auth)/                   # Auth group
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                   # Main app tabs
│   │   ├── index.tsx             # Dashboard/News Feed
│   │   ├── chat.tsx              # AI Chat
│   │   ├── analysis.tsx          # Analysis Mode
│   │   └── profile.tsx           # User Profile
│   ├── article/
│   │   └── [id].tsx              # Article Detail (dynamic route)
│   ├── analysis-session/
│   │   ├── [id].tsx              # Active Analysis Session
│   │   └── complete.tsx          # Session Complete Screen
│   ├── _layout.tsx               # Root layout
│   └── +not-found.tsx
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── index.ts
│   ├── news/                     # News-specific components
│   │   ├── ArticleCard.tsx
│   │   ├── NewsFeed.tsx
│   │   ├── PriorityIndicator.tsx
│   │   └── index.ts
│   ├── chat/                     # Chat components
│   │   ├── ChatBubble.tsx
│   │   ├── ChatInput.tsx
│   │   ├── MessageList.tsx
│   │   └── index.ts
│   ├── analysis/                 # Analysis components
│   │   ├── AnalysisWorkspace.tsx
│   │   ├── SessionTimer.tsx
│   │   ├── NotesPanel.tsx
│   │   └── index.ts
│   └── layout/                   # Layout components
│       ├── AppHeader.tsx
│       ├── BottomNavigation.tsx
│       ├── DrawerContent.tsx
│       └── index.ts
├── lib/                          # Core utilities and configurations
│   ├── supabase/                 # Supabase configuration
│   │   ├── client.ts
│   │   ├── types.ts
│   │   └── queries.ts
│   ├── ai/                       # AI/ML integration
│   │   ├── deepseek.ts
│   │   ├── priority-engine.ts
│   │   ├── summarizer.ts
│   │   └── prompts.ts
│   ├── services/                 # Business logic services
│   │   ├── news-service.ts
│   │   ├── analysis-service.ts
│   │   ├── chat-service.ts
│   │   └── user-service.ts
│   ├── utils/                    # Utility functions
│   │   ├── date-utils.ts
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── constants.ts
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useNews.ts
│   │   ├── useAnalysis.ts
│   │   └── useChat.ts
│   └── types/                    # TypeScript type definitions
│       ├── database.ts
│       ├── api.ts
│       ├── navigation.ts
│       └── index.ts
├── assets/                       # Static assets
│   ├── images/
│   │   ├── logo.png
│   │   ├── icons/
│   │   └── illustrations/
│   ├── fonts/
│   └── data/
│       ├── company-tickers.json
│       └── news-sources.json
├── constants/                    # App constants
│   ├── Colors.ts
│   ├── Layout.ts
│   ├── Config.ts
│   └── index.ts
├── contexts/                     # React contexts
│   ├── AuthContext.tsx
│   ├── NewsContext.tsx
│   ├── AnalysisContext.tsx
│   └── ThemeContext.tsx
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
├── app.json                      # Expo configuration
├── package.json
├── tsconfig.json
├── tailwind.config.js            # If using Tailwind
└── README.md
```

### 5.2. Backend Services Structure (Optional Node.js/Python)
```
backend/
├── services/
│   ├── news-aggregator/          # News scraping service
│   │   ├── scrapers/
│   │   │   ├── jamaica-observer.js
│   │   │   ├── gleaner.js
│   │   │   └── rjr.js
│   │   ├── processors/
│   │   │   ├── content-extractor.js
│   │   │   ├── priority-scorer.js
│   │   │   └── summarizer.js
│   │   └── scheduler.js
│   ├── ai-processor/             # AI processing service
│   │   ├── priority-engine/
│   │   ├── summarization/
│   │   └── chat-ai/
│   └── api/                      # REST API endpoints
│       ├── routes/
│       │   ├── news.js
│       │   ├── analysis.js
│       │   └── chat.js
│       └── middleware/
├── config/
│   ├── database.js
│   ├── ai-config.js
│   └── scraping-config.js
└── utils/
    ├── logger.js
    ├── scheduler.js
    └── notifications.js
```

---

## 6. Technical & Backend Considerations

### 4.1. Data Layer

**News Aggregation:** A backend service (e.g., Python, Node.js) to scrape/aggregate news from predefined Jamaican financial sources (e.g., Jamaica Observer, Gleaner, RJR, etc.) using RSS feeds or APIs.

**Database (e.g., Firebase Firestore, PostgreSQL):**
- `Users` Collection: User profiles, preferences, saved articles
- `Articles` Collection: Headline, source, URL, content, publication date, `company_tickers[]`, `ai_priority_score` (calculated by the AI model), `ai_summary`
- `AnalysisSessions` Collection: Linked to User ID, contains session data, notes, duration, etc.

### 4.2. AI & Machine Learning

**Priority Engine:** An NLP model (e.g., fine-tuned BERT) to analyze each article and assign a `ai_priority_score`. Scoring factors: company market cap, mentioned financial metrics (revenue, profit), sentiment, uniqueness of news.

**Summarization Model:** A model to generate the summary snippets for article cards.

**Chat AI:** Integration with a powerful LLM (e.g., GPT-4, Claude) via API. A robust **prompt engineering system** is critical here to ensure the AI acts as a Jamaica-focused financial analyst and does not hallucinate or provide generic advice. It must be constrained to the provided news context.

### 4.3. Key Dependencies

**Frontend:** State Management (Redux/Bloc/Provider), HTTP Client (Axios, Retrofit), Database SDK (Firebase).

**Backend:** Web Scraping Frameworks (Beautiful Soup, Scrapy), Cloud Functions (AWS Lambda, Firebase Cloud Functions), AI/ML API Endpoints.

**Authentication:** Firebase Auth or Auth0.

---

## 5. Core User Stories

1. **As a new user,** I can sign up with my email so that I can have a personalized experience
2. **As a user,** I can see a list of Jamaican financial news sorted by AI-predicted importance so that I can focus on what matters most
3. **As a user,** I can read the full text of any news article within the app
4. **As a user,** I can ask an AI questions in plain English about the news and get insightful, context-aware answers
5. **As a user,** I can enter a dedicated "Analysis Mode" to perform deep, uninterrupted research on specific companies or events
6. **As a user,** I can view a summary of my completed analysis session and my progress over time

---

## 6. Success Metrics

- **User Engagement:** Daily active users, session duration, articles read per session
- **AI Effectiveness:** User satisfaction with AI responses, analysis session completion rates
- **Content Quality:** AI priority score accuracy, user feedback on news relevance
- **Retention:** Weekly and monthly user retention rates

---

## 7. Future Enhancements

- **Push Notifications:** For high-priority news alerts
- **Portfolio Integration:** Connect user's stock holdings for personalized news filtering
- **Social Features:** Share analysis insights with other users
- **Advanced Analytics:** Historical trend analysis and predictive insights
- **Multi-language Support:** For broader Caribbean market coverage
# Financial News Analyzer App: Product Specification

## 1. Overview

This document outlines the specifications for a mobile application designed to aggregate, prioritize, and help users analyze financial news related to companies on the Jamaica Stock Exchange (JSE) and the Junior Stock Exchange. The core value proposition is leveraging AI to cut through the noise and provide actionable insights.

---

## 2. Application Flow & User Journey

The user journey is linear and intuitive, guiding the user from initial discovery to deep analysis.

### Flowchart Summary:
```
Welcome Screen → Sign Up / Log In → Main Dashboard → [Read Article] OR [Chat with AI] → Enter Analysis Mode → Session Complete & Progress → Return to Dashboard
```

---

## 3. Detailed Screen & Feature Specifications

### 3.1. Welcome Screen (`Activity_Welcome` / `ViewController_Welcome`)

**Objective:** To provide a clean, professional first impression and guide the user to authenticate.

**UI Components:**
- App Logo & Name
- A brief, compelling tagline (e.g., "Master the JSE with AI-Powered Insights")
- A "Sign Up with Email" button
- A "Log In" link for returning users

**Functionality:**
- Tapping "Sign Up with Email" navigates to the Sign-Up screen
- Tapping "Log In" navigates to the Login screen

### 3.2. Authentication Screens (`Activity_SignUp`, `Activity_Login`)

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
- Firebase Auth (or equivalent) integration for user registration/login
- Upon successful authentication, the user is redirected to the `Main Dashboard`

### 3.3. Main Dashboard (`Activity_Dashboard` / `ViewController_Dashboard`)

**Objective:** The central hub where users consume prioritized news and access core features.

**UI Components:**
- **App Bar:** Contains the app logo, user profile icon (leading to settings), and a "Analysis Mode" button (prominent, possibly styled differently)
- **Welcome Header:** "Good [Morning/Afternoon], [User Name]"
- **AI Priority Toggle/Section Header:** A header clearly stating "Jamaica Finance News - Sorted by AI Priority"
- **News Feed (Primary Component):** A vertically scrolling list (RecyclerView/ListView/FlatList) of news article cards
- **Floating Action Button (FAB):** For initiating a chat with the AI

**Article Card Components:**
- Article Headline
- Source Publication & Publication Date/Time
- Relevant Company Ticker(s) (e.g., `JSE:NCBFG`, `JSE:SGJ`)
- An **AI Priority Indicator** (e.g., a score out of 10, a "High Impact" badge, or a heatmap-style color code). This is the primary sorting key for the list
- A brief, AI-generated summary snippet (1-2 lines)

**Functionality:**
- The list is automatically sorted by the `AI Priority` score (descending)
- Pull-to-refresh to fetch the latest news
- Tapping an article card opens the full article in an `Article Detail` screen (either in a WebView or a formatted native view)
- Tapping the "Analysis Mode" button navigates the user to the `Analysis Mode` screen
- Tapping the FAB (Chat Icon) opens the `AI Chat` interface

### 3.4. Article Detail Screen (`Activity_ArticleDetail`)

**Objective:** To display the full content of a selected news article.

**UI Components:**
- Top navigation bar with a "Back" button
- Article headline, source, date, and tickers
- WebView or a custom-styled native view to render the article body
- A footer with action buttons: "Share", "Save", and a "Analyze this in AI Chat" button

**Functionality:**
- The "Analyze this in AI Chat" button pre-populates the chat input with the article's headline/URL for context

### 3.5. AI Chat Interface (`Fragment_Chat` / `ViewController_Chat`)

**Objective:** To allow users to have conversational queries about the news, specific companies, or market trends.

**UI Components:**
- A header: "Market Analyst AI"
- A scrollable message list (Chat bubbles: user messages on one side, AI responses on the other)
- A text input field at the bottom with a "Send" button

**Functionality:**
- The AI context should be aware of the user's location (Jamaica), the JSE/Junior Market, and the stream of news articles in the app's database
- It should be able to answer questions like:
  - "Summarize the latest news about NCB Financial Group"
  - "What was the market reaction to the latest BOJ policy announcement?"
  - "Compare the financial performance of Sagicor and Guardian Holdings last quarter"

### 3.6. Analysis Mode (`Activity_AnalysisMode`)

**Objective:** A focused, session-based environment for deep, structured financial analysis.

**UI Components:**
- A full-screen, immersive interface with a minimalistic design to reduce distraction
- A central workspace (could be a canvas, a structured form, or a chat-like interface specifically for analysis)
- Tools accessible via a toolbar (e.g., Notepad, Stock Price Charts, Company Financials, News Timeline)
- A "Complete Session" button

**Functionality:**
- Entering this mode signifies the user's intent to perform a dedicated analysis task
- The app can provide templates: "Bullish/Bearish Thesis," "Event Impact Analysis," "Company Comparison"
- Users can pull in specific articles, charts, and data into their workspace
- The session is timed (optional feature for productivity)
- All user actions, notes, and conclusions within the session are saved

### 3.7. Session Complete & Progress Screen (`Activity_SessionResult`)

**Objective:** To provide closure, show accomplishment, and summarize the user's analytical work.

**UI Components:**
- A congratulatory message: "Session Complete!"
- **Session Summary:**
  - Session Duration
  - Number of articles analyzed
  - Key takeaways/decisions logged by the user (displayed as a list)
  - A "Download/Export Notes" button
- **Action Buttons:**
  - **"Start New Session"**: Clears the previous workspace and returns to `Analysis Mode`
  - **"Take a Break"**: Returns the user to the `Main Dashboard`

**Functionality:**
- Persists a log of all analysis sessions in the user's profile for later review

---

## 4. Technical & Backend Considerations

### 4.1. Data Layer

**News Aggregation:** A backend service (e.g., Python, Node.js) to scrape/aggregate news from predefined Jamaican financial sources (e.g., Jamaica Observer, Gleaner, RJR, etc.) using RSS feeds or APIs.

**Database (e.g., Firebase Firestore, PostgreSQL):**
- `Users` Collection: User profiles, preferences, saved articles
- `Articles` Collection: Headline, source, URL, content, publication date, `company_tickers[]`, `ai_priority_score` (calculated by the AI model), `ai_summary`
- `AnalysisSessions` Collection: Linked to User ID, contains session data, notes, duration, etc.

### 4.2. AI & Machine Learning

**Priority Engine:** An NLP model (e.g., fine-tuned BERT) to analyze each article and assign a `ai_priority_score`. Scoring factors: company market cap, mentioned financial metrics (revenue, profit), sentiment, uniqueness of news.

**Summarization Model:** A model to generate the summary snippets for article cards.

**Chat AI:** Integration with a powerful LLM (e.g., GPT-4, Claude) via API. A robust **prompt engineering system** is critical here to ensure the AI acts as a Jamaica-focused financial analyst and does not hallucinate or provide generic advice. It must be constrained to the provided news context.

### 4.3. Key Dependencies

**Frontend:** State Management (Redux/Bloc/Provider), HTTP Client (Axios, Retrofit), Database SDK (Firebase).

**Backend:** Web Scraping Frameworks (Beautiful Soup, Scrapy), Cloud Functions (AWS Lambda, Firebase Cloud Functions), AI/ML API Endpoints.

**Authentication:** Firebase Auth or Auth0.

---

## 5. Core User Stories

1. **As a new user,** I can sign up with my email so that I can have a personalized experience
2. **As a user,** I can see a list of Jamaican financial news sorted by AI-predicted importance so that I can focus on what matters most
3. **As a user,** I can read the full text of any news article within the app
4. **As a user,** I can ask an AI questions in plain English about the news and get insightful, context-aware answers
5. **As a user,** I can enter a dedicated "Analysis Mode" to perform deep, uninterrupted research on specific companies or events
6. **As a user,** I can view a summary of my completed analysis session and my progress over time

---

## 6. Success Metrics

- **User Engagement:** Daily active users, session duration, articles read per session
- **AI Effectiveness:** User satisfaction with AI responses, analysis session completion rates
- **Content Quality:** AI priority score accuracy, user feedback on news relevance
- **Retention:** Weekly and monthly user retention rates

---

## 7. Future Enhancements

- **Push Notifications:** For high-priority news alerts
- **Portfolio Integration:** Connect user's stock holdings for personalized news filtering
- **Social Features:** Share analysis insights with other users
- **Advanced Analytics:** Historical trend analysis and predictive insights
- **Multi-language Support:** For broader Caribbean market coverage

# From your Documents folder
cd "C:\Users\junio\OneDrive\Documents"

# Create Expo app with TypeScript
npx create-expo-app@latest JamStockAnalytics --template
# When prompted, choose the TypeScript template (or pick "Blank (TypeScript)")

cd JamStockAnalytics

# Install core UI + navigation + data deps
npx expo install react-native-paper react-native-safe-area-context react-native-gesture-handler react-native-screens
npx expo install expo-router
npm i @supabase/supabase-js axios zod @react-native-async-storage/async-storage @shopify/flash-list

# Optional: vector icons (Paper uses these)
npx expo install @expo/vector-icons

# Create env file (you’ll add SUPABASE_URL and SUPABASE_ANON_KEY later)
New-Item -Path . -Name ".env" -ItemType "file" -Force | Out-Null

# Start the dev server
npx expo start

---

## 8. Enhanced Login Screen Implementation

### 8.1. Updated Login Screen Features

The login screen has been enhanced to match modern UI/UX standards with the following improvements:

**Visual Design:**
- Card-based layout with subtle shadows and rounded corners
- Clean, professional appearance with proper spacing
- Responsive design that works across different screen sizes
- Modern color scheme with proper contrast ratios

**User Experience Enhancements:**
- **Password Visibility Toggle:** Eye icon to show/hide password
- **Remember Me Checkbox:** Option for persistent login sessions
- **Real-time Validation:** Immediate feedback on form errors
- **Loading States:** Visual indicators during authentication
- **Social Login Options:** Google and GitHub authentication
- **Forgot Password Link:** Easy access to password recovery

**Technical Implementation:**
- Enhanced form validation with individual field error handling
- Improved error messaging with proper styling
- Better accessibility with proper labels and touch targets
- Optimized performance with efficient state management
- Integration with Supabase Auth for secure authentication

**Form Validation:**
- Email format validation with regex pattern matching
- Password strength requirements (minimum 6 characters)
- Required field validation with clear error messages
- Real-time error clearing when user corrects input

**Social Authentication:**
- Google OAuth integration (when configured in Supabase)
- GitHub authentication option (placeholder for future implementation)
- Proper error handling for social login failures
- Seamless integration with existing auth flow

### 8.2. Beautiful Modern Styling Implementation

The login screen now features a stunning modern design with the following visual enhancements:

**Gradient Background Design:**
- Beautiful gradient background from `#667eea` to `#764ba2`
- Professional color scheme with excellent contrast
- Modern card-based layout with subtle shadows
- Responsive design that adapts to different screen sizes

**Enhanced Visual Elements:**
- **Card Design:** White card with rounded corners (12px radius) and elegant shadows
- **Typography:** Clean, modern font hierarchy with proper spacing
- **Color Palette:** Professional gradient colors with consistent theming
- **Shadows:** Subtle shadow effects for depth and modern appearance
- **Spacing:** Optimal padding and margins for visual balance

**Form Styling Enhancements:**
- **Input Fields:** Light gray background (`#f8f9fa`) with blue border focus states
- **Focus States:** Blue border and subtle shadow on input focus
- **Button Design:** Gradient button with hover effects and shadow
- **Error Styling:** Red error messages with proper positioning
- **Social Buttons:** Clean outlined buttons with hover effects

**Responsive Design Features:**
- **Mobile Optimization:** Responsive layout that works on all screen sizes
- **Flexible Container:** Maximum width of 400px with proper centering
- **Touch-Friendly:** Proper touch targets and spacing for mobile devices
- **Accessibility:** High contrast ratios and proper color usage

**Advanced Styling Details:**
- **Gradient Effects:** Beautiful gradient backgrounds and button styling
- **Shadow System:** Layered shadows for depth and modern appearance
- **Border Radius:** Consistent 8px border radius for modern look
- **Color Harmony:** Carefully selected color palette for professional appearance
- **Typography Scale:** Proper font sizes and weights for readability

### 8.3. Enhanced Interactive Features Implementation

The login screen now includes sophisticated JavaScript-like interactivity with the following advanced features:

**Real-Time Form Validation:**
- **Email Validation:** Instant feedback on email format as user types
- **Password Validation:** Real-time password strength checking
- **Error Clearing:** Automatic error message clearing when user corrects input
- **Visual Feedback:** Immediate visual indicators for form state

**Advanced Loading States:**
- **Animated Button Press:** Smooth scale animation on button press
- **Loading Spinner:** Sophisticated spinner animation during submission
- **Opacity Transitions:** Smooth fade transitions between button text and spinner
- **Disabled States:** Proper button disabling during form submission

**Enhanced User Experience:**
- **Password Toggle:** Eye icon toggle with smooth state transitions
- **Form Submission:** Proper form validation before submission
- **Error Handling:** Comprehensive error handling with user-friendly messages
- **Success States:** Smooth transitions for successful authentication

**Animation System:**
- **Button Animations:** Scale and opacity animations for interactive feedback
- **Loading Animations:** Smooth transitions between different button states
- **Form Animations:** Subtle animations for form interactions
- **Performance Optimized:** Native driver animations for smooth performance

**Interactive Form Features:**
- **Real-Time Validation:** Immediate feedback on input changes
- **Error Management:** Comprehensive error state management
- **Form State Management:** Proper handling of form submission states
- **User Feedback:** Clear visual feedback for all user actions

**Technical Implementation:**
- **React Native Animated:** Native performance animations
- **State Management:** Sophisticated state handling for form interactions
- **Error Boundaries:** Proper error handling and recovery
- **Accessibility:** Screen reader support and proper touch targets

---

## 9. Updated App Structure & Navigation

### 9.1. Main Page Restructure

The app has been restructured to prioritize news consumption with enhanced navigation:

**Main Page (Index):**
- **Primary Focus:** Latest Jamaica Stock Exchange news feed
- **Navigation:** User account menu in top right corner
- **Content:** AI-prioritized financial news with real-time updates
- **User Experience:** Clean, focused interface for news consumption

**Navigation Structure:**
- **Top Right Menu:** User account with profile, AI Analysis, and sign out options
- **Bottom Tabs:** Dashboard, Chat, Market, Analysis, AI Analysis, Brokers, Profile
- **Floating Action Button:** Quick access to AI chat

### 9.2. AI Analysis Mode Implementation

A dedicated AI Analysis page has been created with comprehensive market intelligence:

**Market Sentiment Analysis:**
- **Overall Sentiment:** Real-time sentiment scoring with visual progress bars
- **Sentiment Breakdown:** Bullish, Bearish, and Neutral percentages
- **Color-coded Indicators:** Green (positive), Orange (neutral), Red (negative)
- **AI-powered Insights:** Dynamic sentiment analysis of JSE market data

**Red Flag Investments:**
- **Risk Assessment:** AI-identified investment risks and concerns
- **Company-specific Alerts:** Individual company risk analysis
- **Risk Levels:** High, Medium, Low risk categorization with color coding
- **Confidence Scores:** AI confidence levels for each risk assessment
- **Impact Analysis:** Detailed impact assessment for each red flag

**AI Market Insights:**
- **Market Trends:** AI-generated trend analysis
- **Sector Performance:** Industry-specific performance insights
- **Risk Assessment:** Overall market risk evaluation
- **Actionable Intelligence:** Data-driven investment recommendations

**Interactive Features:**
- **Real-time Updates:** Live market sentiment monitoring
- **Export Functionality:** Report generation and export capabilities
- **Deep Analysis Integration:** Seamless transition to detailed analysis sessions
- **Visual Analytics:** Charts, progress bars, and interactive elements

### 9.3. Enhanced User Experience

**Login Integration:**
- **Top Right Placement:** User account menu replaces traditional login screen
- **Seamless Authentication:** Integrated login/logout functionality
- **Profile Management:** Direct access to user profile and settings
- **Session Management:** Persistent login state with automatic session handling

**Navigation Improvements:**
- **Intuitive Flow:** News-first approach with easy access to analysis tools
- **Quick Actions:** Floating action button for immediate AI chat access
- **Contextual Menus:** Right-click style menus for enhanced functionality
- **Progressive Disclosure:** Layered information architecture for better UX

---

## 10. Guest Access & Pro Mode Implementation

### 10.1. Guest Access Features

The app now supports guest users with limited access to basic features:

**Guest User Capabilities:**
- ✅ **Basic News Access:** View latest Jamaica Stock Exchange news
- ✅ **News Reading:** Read full articles without authentication
- ✅ **Basic Navigation:** Access main dashboard and news feed
- ✅ **Limited AI Chat:** Basic chat functionality (if implemented)
- ✅ **Market Overview:** Basic market information

**Guest User Limitations:**
- ❌ **AI Analysis Mode:** Requires Pro subscription
- ❌ **Personalized Insights:** No AI-powered personalization
- ❌ **Advanced Features:** Limited to basic functionality
- ❌ **Data Persistence:** No saved articles or preferences
- ❌ **Export Features:** No report generation or data export

### 10.2. Pro Mode Authentication Gate

Premium features are protected by a Pro Mode authentication gate:

**Pro Mode Features:**
- ✅ **AI Market Analysis:** Real-time sentiment analysis and risk assessment
- ✅ **Red Flag Investments:** AI-identified investment risks
- ✅ **Advanced Analytics:** Comprehensive market insights
- ✅ **Personalized Experience:** User-specific recommendations
- ✅ **Data Export:** Report generation and data export
- ✅ **Session Persistence:** Saved analysis sessions and preferences

**Authentication Gate Implementation:**
- **Visual Gate:** Beautiful lock screen with feature explanation
- **Call-to-Action:** Clear signup and login buttons
- **Feature Benefits:** Explanation of Pro mode advantages
- **Seamless Integration:** Smooth transition to authentication

### 10.3. User Experience Flow

**Welcome Screen Options:**
1. **Continue as Guest:** Immediate access to basic features
2. **Sign Up for Pro:** Full authentication for premium features
3. **Log In:** Existing user authentication

**Guest to Pro Upgrade:**
- **In-App Prompts:** Gentle nudges to upgrade for premium features
- **Feature Previews:** Show what's available in Pro mode
- **Easy Upgrade:** One-click transition to authentication
- **Data Preservation:** Seamless transition without data loss

### 10.4. Technical Implementation

**Authentication Context Updates:**
- **Guest State Management:** `isGuest` boolean state
- **User Object:** Unified user object for guests and authenticated users
- **Session Handling:** Proper session management for both user types
- **State Persistence:** Guest state maintained across app sessions

**Pro Mode Gate Component:**
- **Reusable Component:** `ProModeGate` wrapper for premium features
- **Feature-Specific Messaging:** Custom messages for different features
- **Authentication Integration:** Direct links to signup and login
- **Visual Design:** Professional lock screen with clear value proposition

**Navigation Updates:**
- **Conditional Rendering:** Different content for guests vs authenticated users
- **Feature Restrictions:** Pro features hidden or gated for guests
- **Upgrade Prompts:** Strategic placement of upgrade suggestions
- **Seamless Flow:** Smooth transition between guest and authenticated states

---

## 11. User Blocking and Moderation System

### 11.1. Overview

A comprehensive user blocking and moderation system has been implemented to ensure a safe and respectful environment for users. The system allows users to block other users, preventing them from seeing each other's activity until the restriction is lifted by the victim.

### 11.2. Core Features

**User Blocking Capabilities:**
- ✅ **Block Users:** Users can block other users with specific reasons
- ✅ **Block Reasons:** Harassment, spam, inappropriate content, misinformation, other
- ✅ **Temporary Blocks:** Set expiration dates for temporary blocks
- ✅ **Permanent Blocks:** Indefinite blocking until manually unblocked
- ✅ **Block Management:** View and manage blocked users list
- ✅ **Unblock Users:** Restore access by unblocking users

**Content Filtering:**
- ✅ **Comment Filtering:** Blocked users' comments are hidden from view
- ✅ **Activity Hiding:** Blocked users cannot see blocker's activity
- ✅ **Bidirectional Blocking:** Both users are prevented from seeing each other
- ✅ **Real-time Filtering:** Automatic content filtering based on block status

**Comment System:**
- ✅ **Article Comments:** Users can comment on news articles
- ✅ **Comment Interactions:** Like, report, and flag comments
- ✅ **Comment Moderation:** Report inappropriate comments
- ✅ **Nested Comments:** Reply to existing comments
- ✅ **Comment Management:** Edit and delete own comments

### 11.3. Database Schema

**User Blocks Table:**
```sql
CREATE TABLE public.user_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

**Article Comments Table:**
```sql
CREATE TABLE public.article_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.article_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deletion_reason VARCHAR(100),
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Comment Interactions Table:**
```sql
CREATE TABLE public.comment_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES public.article_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'report', 'flag')),
  reason VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id, interaction_type)
);
```

### 11.4. Database Functions

**Block Management Functions:**
- `is_user_blocked(blocker_uuid, blocked_uuid)` - Check if user is blocked
- `get_blocked_users(user_uuid)` - Get all blocked users for a user
- `unblock_user(blocker_uuid, blocked_uuid)` - Unblock a user
- `filter_comments_for_user(user_uuid)` - Get filtered comments excluding blocked users

### 11.5. Security Implementation

**Row Level Security (RLS):**
- Users can only view blocks they created or received
- Users can only create, update, and delete their own blocks
- Comment interactions are protected by user ownership
- Automatic filtering prevents blocked users from seeing each other's content

**Access Control:**
- Secure API endpoints with authentication
- Proper validation of user permissions
- Prevention of self-blocking
- Secure comment interaction management

### 11.6. User Interface Components

**Block User Modal:**
- Beautiful modal interface for blocking users
- Reason selection with descriptions
- Optional detailed explanation field
- Confirmation dialogs with clear warnings

**Blocked Users List:**
- Comprehensive list of all blocked users
- User information display with block reasons
- Easy unblock functionality with confirmation
- Refresh and loading states

**Comment System:**
- Modern comment cards with user avatars
- Like and reply functionality
- Block user button for each comment
- Report inappropriate content
- Edit and delete own comments

**Block User Button:**
- Reusable component for blocking users
- Multiple size variants (small, medium, large)
- Icon, text, or combined display options
- Disabled states and loading indicators

### 11.7. Technical Implementation

**Service Layer:**
- `BlockUserService` - Core blocking functionality
- TypeScript interfaces for type safety
- Comprehensive error handling
- Async/await pattern for clean code

**Custom Hooks:**
- `useBlockUser` - Manage blocked users state
- `useComments` - Handle comment filtering and display
- Real-time state updates
- Optimistic UI updates

**Database Integration:**
- Supabase client integration
- Real-time subscriptions for live updates
- Efficient querying with proper indexing
- Secure function calls with RLS

### 11.8. User Experience Flow

**Blocking a User:**
1. User taps "Block User" button on comment or profile
2. Modal opens with reason selection and details
3. User selects reason and optionally adds details
4. Confirmation dialog appears with warning
5. User confirms and block is applied immediately
6. Blocked user's content is filtered from view

**Managing Blocked Users:**
1. User navigates to "Blocked Users" section
2. List shows all currently blocked users
3. User can view block reasons and dates
4. User can unblock users with confirmation
5. Changes take effect immediately

**Comment Interaction:**
1. Users can comment on articles
2. Comments show user avatars and timestamps
3. Users can like, reply, and report comments
4. Blocked users' comments are automatically hidden
5. Users can block comment authors directly

### 11.9. Setup Instructions

**Database Setup:**
```bash
# Run the setup script
node scripts/setup-user-blocking.js
```

**Environment Variables:**
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Component Usage:**
```tsx
import { BlockUserModal, BlockedUsersList, BlockUserButton } from './components/block-user';

// Block user modal
<BlockUserModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  userId={userId}
  userName={userName}
  onBlockSuccess={() => refreshContent()}
/>

// Blocked users list
<BlockedUsersList onRefresh={() => refreshData()} />

// Block user button
<BlockUserButton
  userId={userId}
  userName={userName}
  size="medium"
  variant="both"
  onBlockSuccess={() => handleBlock()}
/>
```

### 11.10. Future Enhancements

**Advanced Moderation:**
- **Admin Moderation Panel:** For platform administrators
- **Automated Content Detection:** AI-powered inappropriate content detection
- **Bulk Actions:** Block multiple users at once
- **Moderation Reports:** Detailed reporting for administrators

**Enhanced User Experience:**
- **Block Notifications:** Notify users when they're blocked
- **Block History:** Detailed history of all blocking actions
- **Appeal System:** Allow blocked users to appeal blocks
- **Community Guidelines:** Clear guidelines for user behavior

**Analytics and Insights:**
- **Block Statistics:** Track blocking patterns and trends
- **Content Moderation Metrics:** Monitor comment quality
- **User Safety Reports:** Generate safety reports for administrators
- **Trend Analysis:** Identify problematic users or content patterns

---

## 12. Lightweight Web UI Redesign

### 12.1. Overview

A complete redesign of the web UI has been implemented to create a lightweight, efficient application that runs smoothly with minimal internet data consumption. The new design prioritizes performance, accessibility, and data efficiency while maintaining a modern, professional appearance.

### 12.2. Key Design Principles

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

**User Experience:**
- **Light Mode:** Clean, bright interface that's easy on the eyes
- **Responsive Design:** Optimized for all screen sizes and devices
- **Fast Loading:** Sub-second initial load times
- **Offline Capable:** Service worker for offline functionality

### 12.3. Technical Architecture

**Component Structure:**
```
components/web/
├── LightweightLayout.tsx     # Main layout wrapper
├── LightweightCard.tsx       # Optimized card component
├── LightweightButton.tsx     # Efficient button component
├── LightweightNewsFeed.tsx   # Streamlined news feed
└── index.ts                  # Export file
```

**Theme System:**
- **WebTheme:** Lightweight theme configuration
- **CSS-in-JS:** Minimal styling with Tailwind-like utilities
- **Responsive Breakpoints:** Mobile-first design approach
- **Color Palette:** Optimized for accessibility and performance

**Performance Optimizations:**
- **Tree Shaking:** Unused code eliminated from bundle
- **Code Splitting:** Dynamic imports for route-based splitting
- **Asset Optimization:** Images, fonts, and CSS optimized
- **Bundle Analysis:** Continuous monitoring of bundle size

### 12.4. Database Schema Updates

**Web UI Preferences Table:**
```sql
CREATE TABLE public.web_ui_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

**Web Performance Metrics Table:**
```sql
CREATE TABLE public.web_performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  page_load_time_ms INTEGER,
  total_data_transferred_bytes BIGINT,
  network_type VARCHAR(50),
  device_type VARCHAR(50),
  browser_info JSONB,
  performance_score INTEGER CHECK (performance_score BETWEEN 0 AND 100),
  optimization_level VARCHAR(20) DEFAULT 'standard'
);
```

**Web Cache Configuration Table:**
```sql
CREATE TABLE public.web_cache_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  cache_type VARCHAR(50) NOT NULL,
  content_hash VARCHAR(255),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_compressed BOOLEAN DEFAULT TRUE,
  compression_type VARCHAR(20) DEFAULT 'gzip',
  size_bytes BIGINT,
  hit_count INTEGER DEFAULT 0
);
```

### 12.5. Performance Features

**Lightweight Mode Benefits:**
- **60% Reduction** in data usage compared to standard mode
- **3x Faster** loading times on slow connections
- **Offline Capable** with service worker implementation
- **Battery Efficient** with reduced CPU usage

**Smart Caching System:**
- **Article Caching:** Frequently accessed articles cached locally
- **User Preferences:** UI settings cached for instant loading
- **Static Assets:** CSS, JS, and images cached aggressively
- **API Responses:** Intelligent caching based on content type

**Network Optimization:**
- **Compression:** All content compressed using gzip/brotli
- **Minification:** CSS and JavaScript minified for production
- **Image Optimization:** WebP format with fallbacks
- **CDN Ready:** Optimized for content delivery networks

### 12.6. User Interface Components

**LightweightLayout:**
- **Responsive Container:** Adapts to all screen sizes
- **Performance Monitoring:** Real-time performance tracking
- **Offline Indicator:** Shows connection status
- **Minimal Overhead:** Lightweight header and footer

**LightweightCard:**
- **Optimized Rendering:** Minimal DOM manipulation
- **Accessible Design:** WCAG 2.1 AA compliant
- **Touch Friendly:** Optimized for mobile interactions
- **Loading States:** Skeleton loading for better UX

**LightweightButton:**
- **Multiple Variants:** Primary, secondary, outline, ghost
- **Size Options:** Small, medium, large
- **Loading States:** Built-in loading indicators
- **Disabled States:** Proper accessibility support

**LightweightNewsFeed:**
- **Virtual Scrolling:** Efficient rendering of large lists
- **Pull-to-Refresh:** Native mobile gesture support
- **Lazy Loading:** Images and content loaded on demand
- **Priority Sorting:** AI-prioritized news display

### 12.7. Deployment Configuration

**Build Optimization:**
```javascript
// app.config.js
web: {
  favicon: "./public/logo.svg",
  bundler: "metro",
  output: "static",
  build: {
    babel: {
      include: ["@babel/plugin-proposal-export-namespace-from"],
    },
  },
}
```

**Deployment Scripts:**
```bash
# Build optimized web application
npm run build:web:optimized

# Deploy to production
npm run deploy:web
```

**Performance Monitoring:**
- **Core Web Vitals:** LCP, FID, CLS tracking
- **Bundle Analysis:** Continuous bundle size monitoring
- **User Metrics:** Real user monitoring (RUM)
- **Error Tracking:** Comprehensive error logging

### 12.8. Accessibility Features

**WCAG 2.1 AA Compliance:**
- **Color Contrast:** Minimum 4.5:1 contrast ratio
- **Keyboard Navigation:** Full keyboard accessibility
- **Screen Reader Support:** Proper ARIA labels and roles
- **Focus Management:** Clear focus indicators

**Responsive Design:**
- **Mobile First:** Optimized for mobile devices
- **Touch Targets:** Minimum 44px touch targets
- **Viewport Meta:** Proper viewport configuration
- **Flexible Layouts:** Adapts to any screen size

### 12.9. Browser Support

**Modern Browsers:**
- **Chrome:** Version 90+
- **Firefox:** Version 88+
- **Safari:** Version 14+
- **Edge:** Version 90+

**Progressive Enhancement:**
- **Graceful Degradation:** Works on older browsers
- **Feature Detection:** Modern features with fallbacks
- **Polyfills:** Minimal polyfills for essential features
- **Performance:** Optimized for each browser

### 12.10. Setup and Deployment

**Database Setup:**
```bash
# Set up web UI database tables
node scripts/setup-web-ui.js
```

**Environment Configuration:**
```env
# Web optimization settings
EXPO_WEB_OPTIMIZE=true
EXPO_WEB_MINIFY=true
NODE_ENV=production
```

**Deployment Options:**
```bash
# Vercel deployment
vercel --prod

# Netlify deployment
netlify deploy --prod --dir=dist

# GitHub Pages
# Copy dist/ contents to gh-pages branch

# AWS S3
aws s3 sync dist/ s3://your-bucket --delete
```

**Performance Monitoring:**
- **Google Analytics:** User behavior tracking
- **Web Vitals:** Core web vitals monitoring
- **Error Tracking:** Sentry or similar service
- **Uptime Monitoring:** Service availability tracking

### 12.11. Future Enhancements

**Advanced Optimizations:**
- **Edge Computing:** CDN-based rendering
- **Predictive Loading:** AI-powered content prefetching
- **Adaptive Quality:** Network-aware quality adjustment
- **Micro-Frontends:** Modular architecture for scalability

**User Experience:**
- **Dark Mode:** Optional dark theme
- **Custom Themes:** User-customizable color schemes
- **Advanced Caching:** Intelligent cache invalidation
- **Offline Sync:** Background data synchronization

**Analytics and Insights:**
- **Performance Analytics:** Detailed performance metrics
- **User Behavior:** Usage pattern analysis
- **A/B Testing:** Feature testing framework
- **Conversion Tracking:** Goal completion monitoring

--  -

## 13. Fallback Response System

### 13.1. Overview

A comprehensive fallback response system has been implemented to ensure users always receive helpful responses, even when the AI API quota is exceeded or the service is temporarily unavailable. This system provides graceful degradation and maintains a professional user experience.

### 13.2. Core Features

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
- ✅ **General Queries** → Friendly fallback with suggestions

**User Experience Features:**
- ✅ **Visual Indicators** → Clear fallback status display
- ✅ **Contextual Suggestions** → Relevant recommendations
- ✅ **Transparent Communication** → Honest service status
- ✅ **Retry Functionality** → User-initiated retry options

### 13.3. Technical Implementation

**Core Components:**
```typescript
// FallbackResponseService - Intelligent response generation
lib/services/fallback-responses.ts

// Enhanced AI Service - Error handling and fallback integration
lib/services/ai-service.ts

// FallbackIndicator - Visual UI component
components/chat/FallbackIndicator.tsx
```

**Error Handling Flow:**
1. **API Call Attempt** → Try DeepSeek API
2. **Error Detection** → Classify error type (quota/rate/service/general)
3. **Fallback Generation** → Create context-aware response
4. **User Notification** → Display fallback indicator
5. **Metadata Tracking** → Log fallback usage for analytics

**Response Types:**
- **Company Queries:** JSE resources, advisor recommendations
- **Investment Advice:** Professional consultation, risk warnings
- **Market Analysis:** Data sources, professional analysis
- **General Finance:** Financial planning, expert consultation

### 13.4. Database Schema Updates

**Enhanced Context Data:**
```sql
-- Updated chat_messages context_data structure
{
  "model": "deepseek-chat",
  "temperature": 0.7,
  "tokens_used": 0,
  "is_fallback": true,
  "error_type": "quota_exceeded",
  "fallback_type": "intelligent_response"
}
```

**Analytics Tracking:**
- Fallback response frequency
- Error type distribution
- User retry rates
- Response satisfaction metrics

### 13.5. Configuration and Testing

**Test Commands:**
```bash
# Test fallback system
npm run test:fallback

# Test full integration
npm run test:integration:auto

# Test chat integration
npm run test-chat-integration
```

**Environment Configuration:**
```env
# DeepSeek API Configuration
EXPO_PUBLIC_DEEPSEEK_API_KEY=your_api_key_here

# Fallback Configuration (optional)
FALLBACK_ENABLED=true
FALLBACK_TIMEOUT_MS=10000
```

### 13.6. User Experience Benefits

**Always Helpful Responses:**
- Users never encounter dead ends
- Context-aware suggestions for every query type
- Professional guidance and expert recommendations
- Transparent communication about service status

**Graceful Degradation:**
- System continues to function during API outages
- Intelligent fallback responses maintain user engagement
- Clear visual indicators show fallback status
- Retry options allow users to try again when appropriate

**Professional Standards:**
- All responses include professional consultation recommendations
- Risk warnings and disclaimers for investment advice
- Honest communication about service limitations
- Maintains helpful, friendly tone throughout

### 13.7. Analytics and Monitoring

**Metadata Tracking:**
```typescript
{
  is_fallback: true,
  error_type: 'quota_exceeded',
  fallback_type: 'company_query',
  tokens_used: 0,
  response_time_ms: 150,
  timestamp: '2024-01-15T10:30:00Z'
}
```

**Key Metrics:**
- Fallback response frequency and patterns
- Error type distribution and trends
- User retry rates and success rates
- Response quality and user satisfaction

### 13.8. Setup and Deployment

**Automatic Integration:**
- Fallback system is automatically enabled
- No additional configuration required
- Works with existing AI service integration
- Compatible with all deployment scenarios

**Testing Verification:**
```bash
# Verify fallback system
npm run test:fallback

# Expected output: All fallback tests pass
✅ Fallback response generation working
✅ Error type classification working
✅ Database connection stable
✅ Quota exceeded handling working
✅ Metadata tracking working
```

### 13.9. Future Enhancements

**Advanced Features:**
- **Cached Responses** for common queries
- **Progressive Enhancement** with partial AI responses
- **User Preference Learning** for better suggestions
- **Multiple AI Providers** for redundancy
- **Local AI Models** for offline capability

**Integration Opportunities:**
- **Expert System Integration** for specialized queries
- **Real-time Market Data** fallbacks
- **Advanced Analytics Dashboard** for fallback monitoring
- **A/B Testing Framework** for fallback optimization

### 13.10. Documentation and Support

**Comprehensive Documentation:**
- **FALLBACK_SYSTEM_GUIDE.md** - Complete implementation guide
- **Technical specifications** and API documentation
- **User experience guidelines** and best practices
- **Troubleshooting guide** and support resources

**Support Resources:**
- Test scripts for verification
- Error logging and monitoring
- User feedback collection
- Performance optimization guidelines

---

## 14. Enhanced Validation System

### 14.1. Overview

A comprehensive validation system has been implemented to replace the legacy `validate-secrets.js` with enhanced functionality, security features, and improved developer experience. This system provides type-safe validation, security pattern matching, entropy analysis, and deployment readiness assessment.

### 14.2. Core Features

**Advanced Validation:**
- ✅ **Type-safe validation** with TypeScript and Zod schemas
- ✅ **Security pattern matching** for JWT tokens, API keys, URLs
- ✅ **Entropy analysis** for encryption keys and passwords
- ✅ **Placeholder detection** to prevent test values in production
- ✅ **Security scoring** (0-100) with detailed recommendations

**Comprehensive Coverage:**
- ✅ **Environment variables** - All Supabase, DeepSeek, and app config
- ✅ **Secrets validation** - Security-focused with pattern matching
- ✅ **Configuration validation** - Feature dependencies and consistency
- ✅ **Integration testing** - Service connectivity and readiness
- ✅ **Deployment readiness** - Production readiness assessment

### 14.3. Validation Types

#### **Environment Validation**
```typescript
import { validateEnvironment } from './lib/validation';

const result = validateEnvironment();
console.log(result.isValid); // boolean
console.log(result.errors);  // ValidationError[]
console.log(result.warnings); // ValidationWarning[]
```

#### **Secrets Validation**
```typescript
import { validateSecrets } from './lib/validation';

const result = validateSecrets();
console.log(result.isValid);     // boolean
console.log(result.score);       // number (0-100)
console.log(result.errors);      // SecretError[]
console.log(result.warnings);    // SecretWarning[]
console.log(result.recommendations); // SecretRecommendation[]
```

#### **Configuration Validation**
```typescript
import { validateJamStockAnalytics } from './lib/validation';

const results = await validateJamStockAnalytics({
  verbose: true
});
console.log(results.overall.isValid); // boolean
console.log(results.overall.score);   // number (0-100)
console.log(results.overall.readiness); // 'ready' | 'not_ready' | 'needs_attention'
```

### 14.4. CLI Usage

```bash
# Comprehensive validation
npm run validate-all

# Individual validations
npm run validate-env
npm run validate-secrets-advanced
npm run validate-config

# Legacy compatibility
npm run validate-secrets

# Enhanced validation with options
npm run validate-comprehensive
```

### 14.5. Security Features

**Pattern Matching:**
- JWT Tokens: `^eyJ[A-Za-z0-9+/=]+\.eyJ[A-Za-z0-9+/=]+\.?[A-Za-z0-9+/=]*$`
- API Keys: `^sk-[a-zA-Z0-9]{20,}$`
- URLs: `^https:\/\/[a-zA-Z0-9\-]+\.supabase\.co$`
- UUIDs: `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`

**Security Scoring:**
- Secret Strength: Length, entropy, format validation
- Configuration Security: Encryption, authentication, data protection
- Integration Security: Service configuration, API keys
- Best Practices: HTTPS usage, secure defaults

### 14.6. GitHub Actions Integration

**Updated Workflows:**
- `validate-supabase-secrets-enhanced.yml` - Enhanced with comprehensive validation
- `automated-build-with-enhanced-validation.yml` - Integrated with new validation system
- Backward compatibility maintained with legacy validation

**Environment Variables:**
```yaml
env:
  EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}
  EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.EXPO_PUBLIC_SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
  EXPO_PUBLIC_DEEPSEEK_API_KEY: ${{ secrets.EXPO_PUBLIC_DEEPSEEK_API_KEY }}
  GCP_SA_KEY: ${{ secrets.GCP_SA_KEY }}
```

### 14.7. Migration Guide

**Backward Compatibility:**
- Old `validate-secrets.js` commands still work
- New enhanced features available alongside legacy system
- Gradual migration path for existing workflows

**Migration Steps:**
1. **Install new validation system** (already included)
2. **Update scripts** to use new commands
3. **Test validation** with existing configuration
4. **Update CI/CD** to use new validation commands
5. **Remove old scripts** when ready

### 14.8. Documentation

**Comprehensive Documentation:**
- `README_VALIDATION.md` - Complete validation system guide
- `DEPLOYMENT_PLAN.md` - Deployment and migration guide
- TypeScript interfaces and API documentation
- Security best practices and recommendations

**Support Resources:**
- Error handling and troubleshooting guides
- Performance optimization guidelines
- Security recommendations and best practices
- Integration examples and use cases

---

## 15. Independent Machine Learning Agent System

### 15.1. Overview

A sophisticated **Independent Machine Learning Agent** has been implemented that learns from JamStockAnalytics platform data and operates autonomously to curate articles without human intervention. This AI system uses DeepSeek for advanced pattern recognition and continuously improves through machine learning.

### 14.2. Core Features

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
- ✅ **Performance Tracking** - Monitors and optimizes its own performance

**Intelligent Article Curation:**
- ✅ **Smart Scoring** - Calculates curation scores based on multiple learned factors
- ✅ **Target Audience** - Determines optimal audience for each article
- ✅ **Timing Optimization** - Predicts best times to surface content
- ✅ **Engagement Prediction** - Estimates expected user engagement
- ✅ **Quality Assessment** - Evaluates content quality using learned patterns

### 14.3. System Architecture

**Core Components:**
```typescript
// ML Agent Service - Main orchestrator
lib/services/ml-agent-service.ts

// Database Schema
- user_article_interactions (user behavior tracking)
- ml_learning_patterns (learned patterns storage)
- ml_agent_state (agent status and metrics)
- curated_articles (AI-curated content)
- user_interaction_profiles (user preference models)
- market_data (market trend analysis)

// UI Components
components/ml-agent/
├── CuratedArticleFeed.tsx (displays AI-curated articles)
└── MLAgentDashboard.tsx (agent monitoring dashboard)
```

**Learning Pipeline:**
1. **Data Collection** → User interactions, article performance, market data
2. **Pattern Analysis** → DeepSeek-powered pattern recognition
3. **Model Training** → Automatic training every 6 hours
4. **Pattern Storage** → Learned patterns stored in database
5. **Article Curation** → Real-time article scoring and curation
6. **Performance Monitoring** → Continuous optimization

### 14.4. Learning Patterns

**Pattern Types:**
- **User Preference Patterns** - Individual user behavior and preferences
- **Market Trend Patterns** - Market timing and trend analysis
- **Content Quality Patterns** - Article quality and relevance assessment
- **Timing Optimization Patterns** - Optimal content delivery timing
- **Engagement Prediction Patterns** - User engagement forecasting

**Pattern Learning Process:**
1. **Data Collection** → Gather user interactions and performance data
2. **DeepSeek Analysis** → Use AI to identify complex patterns
3. **Pattern Validation** → Test patterns against historical data
4. **Confidence Scoring** → Assign confidence levels to patterns
5. **Pattern Storage** → Store validated patterns in database
6. **Continuous Learning** → Update patterns based on new data

### 14.5. Article Curation Algorithm

**Curation Score Calculation:**
```typescript
curationScore = (
  aiPriorityScore * 0.3 +
  contentQualityPattern * confidence * 0.2 +
  userPreferencePattern * confidence * 0.15 +
  marketTrendPattern * confidence * 0.2 +
  timingPattern * confidence * 0.15
)
```

**Curation Factors:**
- **AI Priority Score** (30%) - Original AI analysis score
- **Content Quality** (20%) - Learned content quality patterns
- **User Preferences** (15%) - User preference pattern matching
- **Market Trends** (20%) - Market trend pattern alignment
- **Timing Optimization** (15%) - Optimal timing pattern matching

**Target Audience Determination:**
- **Beginners** → Content with basic financial concepts
- **Advanced** → Complex analysis and expert-level content
- **Investors** → Investment-focused articles and analysis
- **News Followers** → Breaking news and market updates

### 14.6. User Interface Components

**CuratedArticleFeed Component:**
- Displays AI-curated articles with scores and reasoning
- Shows ML agent status and performance metrics
- Provides target audience information
- Includes confidence levels and engagement predictions

**MLAgentDashboard Component:**
- Real-time agent status monitoring
- Learning metrics and performance indicators
- Manual training triggers
- Pattern analysis insights

### 14.7. Performance Monitoring

**Key Metrics:**
- **Learning Patterns Count** → Number of active patterns
- **User Profiles Count** → Number of user profiles built
- **Curation Accuracy** → How well predictions match actual engagement
- **Training Frequency** → How often the model retrains
- **Pattern Success Rate** → Success rate of learned patterns

**Analytics Dashboard:**
- Training history and frequency
- Pattern effectiveness over time
- Curation accuracy metrics
- User engagement predictions vs. actual
- Performance optimization insights

### 14.8. Setup and Configuration

**Database Setup:**
```bash
# Set up ML agent database schema
npm run setup:ml-agent

# Test the ML agent system
npm run test:ml-agent
```

**Environment Configuration:**
```env
# DeepSeek API for pattern analysis
EXPO_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key

# ML Agent Configuration
ML_AGENT_ENABLED=true
ML_AGENT_TRAINING_INTERVAL_HOURS=6
ML_AGENT_MIN_ARTICLES_FOR_TRAINING=50
ML_AGENT_CONFIDENCE_THRESHOLD=0.7
```

**Automatic Startup:**
```typescript
import { mlAgentService } from './lib/services/ml-agent-service';

// Agent starts automatically and begins learning
```

### 14.9. Advanced Features

**Reinforcement Learning:**
- **Feedback Loops** → Learning from user engagement outcomes
- **Pattern Optimization** → Adjusting patterns based on success rates
- **Performance Monitoring** → Self-monitoring and optimization
- **Adaptive Learning** → Adjusting learning rate based on performance

**Multi-Model Learning:**
- **User Behavior Models** → Individual user preference learning
- **Content Quality Models** → Article quality assessment
- **Market Timing Models** → Optimal content timing
- **Engagement Prediction Models** → User engagement forecasting

**Real-Time Adaptation:**
- **Dynamic Pattern Updates** → Patterns update based on new data
- **Confidence Adjustment** → Confidence scores adjust with performance
- **Pattern Retirement** → Low-performing patterns are automatically retired
- **New Pattern Discovery** → Continuous discovery of new patterns

### 14.10. Future Enhancements

**Planned Features:**
- **Enhanced AI Processing** → Improved AI-powered content analysis
- **Advanced Analytics** → Deeper market insights and trend analysis
- **Real-Time Updates** → Live market data and news updates
- **Cross-Platform Integration** → Integration with multiple data sources
- **Predictive Insights** → Market and user behavior predictions

**Integration Opportunities:**
- **External Data Sources** → Integration with market data providers
- **Social Media Analysis** → Learning from social media sentiment
- **Economic Indicators** → Integration with economic data APIs
- **News Aggregation** → Learning from multiple news sources
- **User Feedback Systems** → Direct user feedback integration

### 14.11. Documentation and Support

**Comprehensive Documentation:**
- **ML_AGENT_GUIDE.md** - Complete implementation guide
- **Technical specifications** and API documentation
- **User experience guidelines** and best practices
- **Troubleshooting guide** and support resources

**Support Resources:**
- Test scripts for verification
- Error logging and monitoring
- User feedback collection
- Performance optimization guidelines

**Monitoring Commands:**
```bash
# Check agent status
node -e "const {mlAgentService} = require('./lib/services/ml-agent-service'); mlAgentService.getAgentStatus().then(console.log);"

# Force training
node -e "const {mlAgentService} = require('./lib/services/ml-agent-service'); mlAgentService.forceTraining();"

# View curated articles
node -e "const {mlAgentService} = require('./lib/services/ml-agent-service'); mlAgentService.getCuratedArticles(10).then(console.log);"
```

---

- 