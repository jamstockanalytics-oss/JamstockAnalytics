# JamStockAnalytics App - Navigation Guide

## 🚀 **Complete App Flow**

### **1. Authentication Flow**
```
Welcome Screen → Sign Up/Login → Main Dashboard
```

### **2. Main App Pages (After Login)**

#### **📱 Dashboard** (`/(tabs)/index`)
- **Purpose**: AI-prioritized news feed
- **Features**: 
  - News articles sorted by AI priority
  - Article cards with headlines, sources, dates
  - AI priority indicators (color-coded)
  - Pull-to-refresh functionality
  - Floating Action Button for AI chat

#### **💬 AI Chat** (`/(tabs)/chat`)
- **Purpose**: Market analysis conversations
- **Features**:
  - DeepSeek AI integration
  - Session management
  - Message history
  - Suggestion chips
  - Real-time responses

#### **📊 Analysis Mode** (`/(tabs)/analysis`)
- **Purpose**: Deep financial analysis
- **Features**:
  - JSE company selection (12 companies)
  - Analysis templates (6 types)
  - Sector filtering (7 sectors)
  - Multi-company comparison
  - AI-powered analysis

#### **📈 Market** (`/(tabs)/market`)
- **Purpose**: Market data and insights
- **Features**: Market trends and data

#### **👤 Profile** (`/(tabs)/profile`)
- **Purpose**: User profile and settings
- **Features**: User management

### **3. Detailed Analysis Flow**
```
Analysis Mode → Company Selection → Analysis Session → Results
```

#### **Analysis Templates Available:**
1. **Bullish Thesis** - Positive factors and growth potential
2. **Bearish Thesis** - Risks and negative factors
3. **Event Impact Analysis** - Specific events and market impact
4. **Company Comparison** - Multiple companies side by side
5. **Sector Analysis** - Entire sector trends
6. **Market Research** - General market research

#### **JSE Companies Available:**
- NCB Financial Group (NCBFG)
- Scotia Group Jamaica (SGJ)
- JMMB Group (JMMB)
- Barita Investments (BGL)
- Jamaica Stock Exchange (JSE)
- Sagicor Group (SGL)
- Jamaica Public Service (JPS)
- Wisynco Group (WCO)
- Kingston Wharves (KGN)
- Caribbean Cement (CIB)
- Jamaica Broilers (JWL)
- Derrimon Trading (DGL)

### **4. Article Detail Flow**
```
Dashboard → Article Card → Article Detail → AI Analysis → Chat Discussion
```

### **5. AI Chat Features**
- **Market Analysis**: Ask about market trends
- **Company Insights**: Get information about JSE companies
- **Investment Advice**: General financial guidance
- **News Discussion**: Analyze specific articles

## 🎯 **How to Test All Features**

### **Step 1: Authentication**
1. Open app in browser: `http://localhost:8081`
2. Click "Sign Up with Email"
3. Enter email and password
4. Click "Create Account"

### **Step 2: Explore Dashboard**
1. View AI-prioritized news feed
2. Click on article cards to see details
3. Try pull-to-refresh
4. Click FAB (floating button) for AI chat

### **Step 3: Test AI Chat**
1. Click chat icon or FAB
2. Ask questions like:
   - "What are the current market trends?"
   - "Tell me about NCB Financial Group"
   - "How should I start investing?"

### **Step 4: Run Analysis**
1. Go to Analysis tab
2. Select analysis template (e.g., "Bullish Thesis")
3. Choose companies (e.g., NCBFG, SGJ)
4. Click "Analyze with AI"
5. View comprehensive analysis results

### **Step 5: Test Article Details**
1. Click any article from dashboard
2. View full article with AI analysis
3. Try "Analyze with AI" button
4. Click "Discuss in Chat" to continue conversation

## 🔧 **Navigation Tips**

### **Tab Navigation**
- **Home**: Dashboard with news feed
- **Chat**: AI conversations
- **Analysis**: Company analysis mode
- **Market**: Market data
- **Profile**: User settings

### **Deep Linking**
- Articles: `/article/[id]`
- Analysis Sessions: `/analysis-session/[id]`
- Company Pages: `/stock/[symbol]`

### **Back Navigation**
- Use browser back button
- Or click back buttons in app
- Tab navigation persists state

## 🚨 **Troubleshooting**

### **If you only see signup page:**
1. Complete the signup process
2. Check browser console for errors
3. Ensure Supabase connection is working

### **If pages don't load:**
1. Check network connection
2. Refresh the page
3. Check browser console for errors

### **If AI features don't work:**
1. App uses fallback data when AI services aren't configured
2. All features work with sample data
3. Real AI requires API keys in environment

## ✅ **Expected Behavior**

After successful authentication, you should see:
- **Tab bar** at the bottom with 5 tabs
- **Dashboard** with news articles
- **Smooth navigation** between all pages
- **All features** working with sample data
- **Professional UI** with Material Design

The app is fully functional and ready for testing! 🚀
