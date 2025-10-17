#!/usr/bin/env node

/**
 * Simple News Setup for JamStockAnalytics
 * Sets up news sources and sample articles
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

class SimpleNewsSetup {
  async setupNewsSources() {
    console.log('📰 Setting up news sources...');
    
    const newsSources = [
      {
        name: 'Jamaica Observer',
        base_url: 'https://www.jamaicaobserver.com',
        rss_feed_url: 'https://www.jamaicaobserver.com/rss',
        priority_score: 8,
        is_active: true,
        scraping_frequency_minutes: 120
      },
      {
        name: 'Jamaica Gleaner',
        base_url: 'https://jamaica-gleaner.com',
        rss_feed_url: 'https://jamaica-gleaner.com/rss',
        priority_score: 8,
        is_active: true,
        scraping_frequency_minutes: 120
      },
      {
        name: 'RJR News',
        base_url: 'https://rjrnewsonline.com',
        rss_feed_url: 'https://rjrnewsonline.com/rss',
        priority_score: 7,
        is_active: true,
        scraping_frequency_minutes: 120
      },
      {
        name: 'Loop Jamaica',
        base_url: 'https://www.loopjamaica.com',
        rss_feed_url: 'https://www.loopjamaica.com/rss',
        priority_score: 6,
        is_active: true,
        scraping_frequency_minutes: 120
      },
      {
        name: 'Jamaica Information Service',
        base_url: 'https://jis.gov.jm',
        rss_feed_url: 'https://jis.gov.jm/rss',
        priority_score: 7,
        is_active: true,
        scraping_frequency_minutes: 120
      }
    ];

    try {
      // Insert news sources
      const { data, error } = await supabase
        .from('news_sources')
        .upsert(newsSources, { onConflict: 'name' })
        .select();

      if (error) {
        console.error('❌ Error setting up news sources:', error.message);
        return;
      }

      console.log(`✅ Successfully set up ${data.length} news sources`);
    } catch (error) {
      console.error('❌ Error setting up news sources:', error.message);
    }
  }

  async setupSampleArticles() {
    console.log('📄 Setting up sample articles...');
    
    const sampleArticles = [
      {
        headline: 'NCB Financial Group Reports Strong Q3 Earnings',
        source: 'Jamaica Observer',
        url: 'https://www.jamaicaobserver.com/business/ncb-financial-group-reports-strong-q3-earnings',
        content: 'NCB Financial Group Limited reported strong third quarter earnings with revenue growth of 15% year-over-year. The banking giant continues to show resilience in the Jamaican financial market.',
        excerpt: 'NCB Financial Group Limited reported strong third quarter earnings with revenue growth of 15% year-over-year.',
        publication_date: new Date().toISOString(),
        ai_priority_score: 8.5,
        ai_summary: 'NCB Financial Group shows strong performance with 15% revenue growth in Q3, demonstrating resilience in the Jamaican banking sector.',
        sentiment_score: 0.7,
        relevance_score: 0.9,
        company_tickers: ['NCBFG'],
        tags: ['JSE', 'Banking', 'Earnings'],
        is_processed: true,
        processing_status: 'completed',
        word_count: 45,
        reading_time_minutes: 1
      },
      {
        headline: 'Sagicor Group Jamaica Expands Insurance Portfolio',
        source: 'Jamaica Gleaner',
        url: 'https://jamaica-gleaner.com/business/sagicor-group-jamaica-expands-insurance-portfolio',
        content: 'Sagicor Group Jamaica Limited announced the expansion of its insurance portfolio with new products targeting the growing middle class. The company expects this move to increase market share by 5%.',
        excerpt: 'Sagicor Group Jamaica Limited announced the expansion of its insurance portfolio with new products targeting the growing middle class.',
        publication_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        ai_priority_score: 7.2,
        ai_summary: 'Sagicor Group Jamaica expands insurance portfolio with new products for the middle class, expecting 5% market share increase.',
        sentiment_score: 0.6,
        relevance_score: 0.8,
        company_tickers: ['SGJ'],
        tags: ['JSE', 'Insurance', 'Expansion'],
        is_processed: true,
        processing_status: 'completed',
        word_count: 38,
        reading_time_minutes: 1
      },
      {
        headline: 'JMMB Group Reports Record Investment Returns',
        source: 'RJR News',
        url: 'https://rjrnewsonline.com/business/jmmb-group-reports-record-investment-returns',
        content: 'JMMB Group Limited reported record investment returns for the quarter, with portfolio performance exceeding market expectations. The investment banking firm continues to lead in wealth management services.',
        excerpt: 'JMMB Group Limited reported record investment returns for the quarter, with portfolio performance exceeding market expectations.',
        publication_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        ai_priority_score: 6.8,
        ai_summary: 'JMMB Group reports record investment returns with portfolio performance exceeding market expectations in wealth management.',
        sentiment_score: 0.8,
        relevance_score: 0.7,
        company_tickers: ['JMMB'],
        tags: ['JSE', 'Investment Banking', 'Wealth Management'],
        is_processed: true,
        processing_status: 'completed',
        word_count: 42,
        reading_time_minutes: 1
      },
      {
        headline: 'Guardian Holdings Limited Announces Dividend Increase',
        source: 'Loop Jamaica',
        url: 'https://www.loopjamaica.com/business/guardian-holdings-limited-announces-dividend-increase',
        content: 'Guardian Holdings Limited announced a 10% increase in quarterly dividends, reflecting the company\'s strong financial position and commitment to shareholder value.',
        excerpt: 'Guardian Holdings Limited announced a 10% increase in quarterly dividends, reflecting the company\'s strong financial position.',
        publication_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        ai_priority_score: 7.5,
        ai_summary: 'Guardian Holdings Limited announces 10% dividend increase, reflecting strong financial position and shareholder value commitment.',
        sentiment_score: 0.9,
        relevance_score: 0.8,
        company_tickers: ['GHL'],
        tags: ['JSE', 'Insurance', 'Dividends'],
        is_processed: true,
        processing_status: 'completed',
        word_count: 35,
        reading_time_minutes: 1
      },
      {
        headline: 'Seprod Limited Expands Manufacturing Operations',
        source: 'Jamaica Information Service',
        url: 'https://jis.gov.jm/business/seprod-limited-expands-manufacturing-operations',
        content: 'Seprod Limited announced the expansion of its manufacturing operations with a new facility in St. Catherine. The expansion is expected to create 200 new jobs and increase production capacity by 30%.',
        excerpt: 'Seprod Limited announced the expansion of its manufacturing operations with a new facility in St. Catherine.',
        publication_date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        ai_priority_score: 6.5,
        ai_summary: 'Seprod Limited expands manufacturing operations with new St. Catherine facility, creating 200 jobs and increasing production capacity by 30%.',
        sentiment_score: 0.7,
        relevance_score: 0.6,
        company_tickers: ['SJ'],
        tags: ['JSE', 'Manufacturing', 'Expansion'],
        is_processed: true,
        processing_status: 'completed',
        word_count: 48,
        reading_time_minutes: 1
      }
    ];

    try {
      // Insert sample articles
      const { data, error } = await supabase
        .from('articles')
        .insert(sampleArticles)
        .select();

      if (error) {
        console.error('❌ Error setting up sample articles:', error.message);
        return;
      }

      console.log(`✅ Successfully set up ${data.length} sample articles`);
    } catch (error) {
      console.error('❌ Error setting up sample articles:', error.message);
    }
  }

  async setupMarketInsights() {
    console.log('💡 Setting up market insights...');
    
    const marketInsights = [
      {
        insight_type: 'daily_summary',
        title: 'JSE Market Summary - Strong Performance Across Sectors',
        content: 'The Jamaica Stock Exchange showed strong performance today with gains across multiple sectors. Financial services led the way with NCBFG and SGJ showing positive momentum. The market continues to demonstrate resilience despite global economic challenges.',
        ai_generated: true,
        confidence_score: 0.85,
        related_tickers: ['NCBFG', 'SGJ', 'JMMB', 'GHL'],
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      },
      {
        insight_type: 'sector_analysis',
        title: 'Banking Sector Analysis - Positive Outlook',
        content: 'The Jamaican banking sector continues to show strength with improved loan portfolios and increased digital adoption. NCBFG and other major banks are well-positioned for continued growth in the current economic environment.',
        ai_generated: true,
        confidence_score: 0.78,
        related_tickers: ['NCBFG', 'JMMB'],
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours from now
      }
    ];

    try {
      // Insert market insights
      const { data, error } = await supabase
        .from('market_insights')
        .insert(marketInsights)
        .select();

      if (error) {
        console.error('❌ Error setting up market insights:', error.message);
        return;
      }

      console.log(`✅ Successfully set up ${data.length} market insights`);
    } catch (error) {
      console.error('❌ Error setting up market insights:', error.message);
    }
  }

  async runSetup() {
    console.log('🚀 Starting simple news setup...');
    
    try {
      await this.setupNewsSources();
      await this.setupSampleArticles();
      await this.setupMarketInsights();
      
      console.log('\n🎉 Simple news setup completed successfully!');
      console.log('\n📋 What was set up:');
      console.log('   • News sources configured');
      console.log('   • Sample articles with AI analysis');
      console.log('   • Market insights and analysis');
      console.log('   • Company ticker identification');
      console.log('   • AI priority scoring');
      
      console.log('\n🚀 Next steps:');
      console.log('   1. Start the application: npm start');
      console.log('   2. Test the news feed functionality');
      console.log('   3. Test AI chat with sample articles');
      console.log('   4. Test analysis mode features');
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
    }
  }
}

// Main execution
async function main() {
  const setup = new SimpleNewsSetup();
  await setup.runSetup();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SimpleNewsSetup;
