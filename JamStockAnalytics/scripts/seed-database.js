#!/usr/bin/env node

/**
 * Database Seed Script for Financial News Analyzer App
 * This script populates the database with initial data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   EXPO_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample data for seeding
const sampleNewsSources = [
  {
    name: 'Jamaica Observer',
    base_url: 'https://www.jamaicaobserver.com',
    rss_feed_url: 'https://www.jamaicaobserver.com/rss',
    priority_score: 8,
    is_active: true,
    scraping_frequency_minutes: 60
  },
  {
    name: 'Jamaica Gleaner',
    base_url: 'https://jamaica-gleaner.com',
    rss_feed_url: 'https://jamaica-gleaner.com/rss',
    priority_score: 8,
    is_active: true,
    scraping_frequency_minutes: 60
  },
  {
    name: 'RJR News',
    base_url: 'https://rjrnewsonline.com',
    rss_feed_url: 'https://rjrnewsonline.com/rss',
    priority_score: 7,
    is_active: true,
    scraping_frequency_minutes: 90
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
    scraping_frequency_minutes: 180
  }
];

const sampleCompanies = [
  // JSE Main Market
  {
    ticker: 'NCBFG',
    company_name: 'NCB Financial Group Limited',
    exchange: 'JSE',
    sector: 'Financial Services',
    industry: 'Banking',
    market_cap: 120000000000,
    is_active: true,
    description: 'Leading financial services group in Jamaica with operations across the Caribbean',
    website_url: 'https://www.ncb.com.jm'
  },
  {
    ticker: 'SGJ',
    company_name: 'Sagicor Group Jamaica Limited',
    exchange: 'JSE',
    sector: 'Financial Services',
    industry: 'Insurance',
    market_cap: 85000000000,
    is_active: true,
    description: 'Premier insurance and financial services company in Jamaica',
    website_url: 'https://www.sagicor.com'
  },
  {
    ticker: 'JMMB',
    company_name: 'JMMB Group Limited',
    exchange: 'JSE',
    sector: 'Financial Services',
    industry: 'Investment Banking',
    market_cap: 45000000000,
    is_active: true,
    description: 'Leading investment banking and wealth management services',
    website_url: 'https://www.jmmb.com'
  },
  {
    ticker: 'GHL',
    company_name: 'Guardian Holdings Limited',
    exchange: 'JSE',
    sector: 'Financial Services',
    industry: 'Insurance',
    market_cap: 32000000000,
    is_active: true,
    description: 'Regional insurance and financial services provider',
    website_url: 'https://www.guardian.co.tt'
  },
  {
    ticker: 'SJ',
    company_name: 'Seprod Limited',
    exchange: 'JSE',
    sector: 'Consumer Goods',
    industry: 'Food & Beverage',
    market_cap: 28000000000,
    is_active: true,
    description: 'Leading manufacturer and distributor of consumer goods',
    website_url: 'https://www.seprod.com'
  },
  {
    ticker: 'PJAM',
    company_name: 'Pan Jamaica Investment Trust Limited',
    exchange: 'JSE',
    sector: 'Investment',
    industry: 'Holding Company',
    market_cap: 15000000000,
    is_active: true,
    description: 'Investment holding company with diversified portfolio',
    website_url: 'https://www.panjam.com'
  },
  {
    ticker: 'CAC',
    company_name: 'CAC 2000 Limited',
    exchange: 'JSE',
    sector: 'Technology',
    industry: 'IT Services',
    market_cap: 8000000000,
    is_active: true,
    description: 'Technology solutions and IT services provider',
    website_url: 'https://www.cac2000.com'
  },
  {
    ticker: 'KLE',
    company_name: 'KLE Group Limited',
    exchange: 'JSE',
    sector: 'Industrial',
    industry: 'Manufacturing',
    market_cap: 12000000000,
    is_active: true,
    description: 'Industrial manufacturing and distribution company',
    website_url: 'https://www.klegroup.com'
  },
  {
    ticker: 'PULS',
    company_name: 'Pulse Investments Limited',
    exchange: 'JSE',
    sector: 'Media',
    industry: 'Entertainment',
    market_cap: 6000000000,
    is_active: true,
    description: 'Media and entertainment company',
    website_url: 'https://www.pulsejamaica.com'
  },
  {
    ticker: 'MIL',
    company_name: 'Mayberry Investments Limited',
    exchange: 'JSE',
    sector: 'Financial Services',
    industry: 'Investment Banking',
    market_cap: 18000000000,
    is_active: true,
    description: 'Investment banking and wealth management services',
    website_url: 'https://www.mayberryinvest.com'
  },
  // Junior Market
  {
    ticker: 'KEX',
    company_name: 'Knutsford Express Services Limited',
    exchange: 'Junior',
    sector: 'Transportation',
    industry: 'Passenger Transport',
    market_cap: 3500000000,
    is_active: true,
    description: 'Premium passenger transportation services',
    website_url: 'https://www.knutsfordexpress.com'
  },
  {
    ticker: 'ISP',
    company_name: 'ISP Finance Limited',
    exchange: 'Junior',
    sector: 'Financial Services',
    industry: 'Microfinance',
    market_cap: 2500000000,
    is_active: true,
    description: 'Microfinance and small business lending',
    website_url: 'https://www.ispfinance.com'
  },
  {
    ticker: 'DCOVE',
    company_name: 'Derrimon Trading Company Limited',
    exchange: 'Junior',
    sector: 'Consumer Goods',
    industry: 'Retail',
    market_cap: 1800000000,
    is_active: true,
    description: 'Retail and distribution of consumer goods',
    website_url: 'https://www.derrimon.com'
  },
  {
    ticker: 'PURITY',
    company_name: 'Purity Bakery Limited',
    exchange: 'Junior',
    sector: 'Consumer Goods',
    industry: 'Food Manufacturing',
    market_cap: 1200000000,
    is_active: true,
    description: 'Food manufacturing and bakery products',
    website_url: 'https://www.puritybakery.com'
  },
  {
    ticker: 'ELITE',
    company_name: 'Elite Diagnostics Limited',
    exchange: 'Junior',
    sector: 'Healthcare',
    industry: 'Medical Services',
    market_cap: 800000000,
    is_active: true,
    description: 'Medical diagnostic and healthcare services',
    website_url: 'https://www.elitediagnostics.com'
  }
];

const sampleArticles = [
  {
    headline: 'BOJ maintains interest rates, signals cautious approach to inflation',
    source: 'Jamaica Observer',
    url: 'https://www.jamaicaobserver.com/business/boj-maintains-rates',
    content: 'The Bank of Jamaica has decided to maintain its current interest rate policy, citing ongoing concerns about inflation and economic stability. The decision comes as the central bank continues to monitor global economic trends and their impact on the local economy.',
    excerpt: 'Bank of Jamaica maintains current interest rates while monitoring inflation trends.',
    publication_date: new Date().toISOString(),
    ai_priority_score: 8.4,
    ai_summary: 'Bank of Jamaica maintains current interest rates while monitoring inflation trends. This decision impacts JSE-listed financial institutions and overall market sentiment.',
    sentiment_score: 0.2,
    relevance_score: 0.9,
    company_tickers: ['NCBFG', 'SGJ', 'JMMB'],
    tags: ['monetary policy', 'interest rates', 'inflation', 'central bank'],
    is_processed: true,
    processing_status: 'completed',
    word_count: 150,
    reading_time_minutes: 1
  },
  {
    headline: 'JSE trading volume increases 15% amid foreign investor interest',
    source: 'Gleaner Business',
    url: 'https://jamaica-gleaner.com/business/jse-volume-increase',
    content: 'The Jamaica Stock Exchange has reported a significant increase in trading volume, with foreign investors showing renewed interest in local equities. This trend reflects growing confidence in the Jamaican economy and its financial markets.',
    excerpt: 'Jamaica Stock Exchange sees significant trading volume increase driven by foreign investor confidence.',
    publication_date: new Date(Date.now() - 86400000).toISOString(),
    ai_priority_score: 7.2,
    ai_summary: 'Jamaica Stock Exchange sees significant trading volume increase driven by foreign investor confidence in local market stability.',
    sentiment_score: 0.6,
    relevance_score: 0.8,
    company_tickers: ['NCBFG', 'SGJ'],
    tags: ['trading volume', 'foreign investment', 'market confidence'],
    is_processed: true,
    processing_status: 'completed',
    word_count: 120,
    reading_time_minutes: 1
  },
  {
    headline: 'Tourism sector shows strong recovery with 25% growth in Q3',
    source: 'Jamaica Gleaner',
    url: 'https://jamaica-gleaner.com/business/tourism-recovery-q3',
    content: 'Jamaica\'s tourism sector has demonstrated robust recovery in the third quarter, with visitor arrivals increasing by 25% compared to the previous year. This growth signals a strong rebound for the country\'s largest foreign exchange earner.',
    excerpt: 'Tourism sector demonstrates robust recovery with significant growth in visitor arrivals.',
    publication_date: new Date(Date.now() - 172800000).toISOString(),
    ai_priority_score: 6.8,
    ai_summary: 'Tourism sector demonstrates robust recovery with significant growth in visitor arrivals and hotel occupancy rates.',
    sentiment_score: 0.7,
    relevance_score: 0.7,
    company_tickers: ['JMMB'],
    tags: ['tourism', 'economic recovery', 'visitor arrivals'],
    is_processed: true,
    processing_status: 'completed',
    word_count: 110,
    reading_time_minutes: 1
  },
  {
    headline: 'NCB Financial Group reports strong Q3 earnings growth',
    source: 'RJR News',
    url: 'https://rjrnewsonline.com/business/ncb-q3-earnings',
    content: 'NCB Financial Group has announced strong third quarter results, with net profit increasing by 18% year-over-year. The bank attributes this growth to improved loan portfolio performance and increased digital banking adoption.',
    excerpt: 'NCB Financial Group reports strong third quarter earnings with 18% profit growth.',
    publication_date: new Date(Date.now() - 259200000).toISOString(),
    ai_priority_score: 7.8,
    ai_summary: 'NCB Financial Group reports strong third quarter earnings with 18% profit growth, driven by improved loan performance and digital banking adoption.',
    sentiment_score: 0.8,
    relevance_score: 0.9,
    company_tickers: ['NCBFG'],
    tags: ['earnings', 'banking', 'profit growth', 'digital banking'],
    is_processed: true,
    processing_status: 'completed',
    word_count: 95,
    reading_time_minutes: 1
  },
  {
    headline: 'Sagicor Group expands regional insurance operations',
    source: 'Loop Jamaica',
    url: 'https://www.loopjamaica.com/business/sagicor-regional-expansion',
    content: 'Sagicor Group Jamaica has announced plans to expand its insurance operations across the Caribbean region. The expansion includes new product offerings and enhanced digital services for customers.',
    excerpt: 'Sagicor Group announces regional expansion of insurance operations with new digital services.',
    publication_date: new Date(Date.now() - 345600000).toISOString(),
    ai_priority_score: 6.5,
    ai_summary: 'Sagicor Group announces regional expansion of insurance operations with new digital services and product offerings across the Caribbean.',
    sentiment_score: 0.5,
    relevance_score: 0.8,
    company_tickers: ['SGJ'],
    tags: ['insurance', 'regional expansion', 'digital services'],
    is_processed: true,
    processing_status: 'completed',
    word_count: 85,
    reading_time_minutes: 1
  }
];

const sampleMarketInsights = [
  {
    insight_type: 'daily_summary',
    title: 'Market Overview: Positive Sentiment Continues',
    content: 'The Jamaican market continues to show positive sentiment with strong performance across financial services and tourism sectors. Investors are showing confidence in the economic recovery trajectory.',
    ai_generated: true,
    confidence_score: 0.85,
    related_tickers: ['NCBFG', 'SGJ', 'JMMB'],
    expires_at: new Date(Date.now() + 86400000).toISOString()
  },
  {
    insight_type: 'sector_analysis',
    title: 'Financial Services Sector Analysis',
    content: 'The financial services sector remains the backbone of the JSE, with strong performance from banking and insurance companies. Digital transformation initiatives are driving growth and efficiency improvements.',
    ai_generated: true,
    confidence_score: 0.78,
    related_tickers: ['NCBFG', 'SGJ', 'JMMB', 'GHL'],
    expires_at: new Date(Date.now() + 172800000).toISOString()
  }
];

async function seedNewsSources() {
  console.log('📰 Seeding news sources...');
  
  try {
    const { data, error } = await supabase
      .from('news_sources')
      .insert(sampleNewsSources);

    if (error) {
      console.log('   ⚠️  News sources may already exist:', error.message);
    } else {
      console.log(`   ✅ Inserted ${sampleNewsSources.length} news sources`);
    }
  } catch (error) {
    console.log('   ⚠️  Error seeding news sources:', error.message);
  }
}

async function seedCompanies() {
  console.log('🏢 Seeding company tickers...');
  
  try {
    const { data, error } = await supabase
      .from('company_tickers')
      .insert(sampleCompanies);

    if (error) {
      console.log('   ⚠️  Company tickers may already exist:', error.message);
    } else {
      console.log(`   ✅ Inserted ${sampleCompanies.length} company tickers`);
    }
  } catch (error) {
    console.log('   ⚠️  Error seeding company tickers:', error.message);
  }
}

async function seedArticles() {
  console.log('📄 Seeding sample articles...');
  
  try {
    const { data, error } = await supabase
      .from('articles')
      .insert(sampleArticles);

    if (error) {
      console.log('   ⚠️  Articles may already exist:', error.message);
    } else {
      console.log(`   ✅ Inserted ${sampleArticles.length} sample articles`);
    }
  } catch (error) {
    console.log('   ⚠️  Error seeding articles:', error.message);
  }
}

async function seedMarketInsights() {
  console.log('💡 Seeding market insights...');
  
  try {
    const { data, error } = await supabase
      .from('market_insights')
      .insert(sampleMarketInsights);

    if (error) {
      console.log('   ⚠️  Market insights may already exist:', error.message);
    } else {
      console.log(`   ✅ Inserted ${sampleMarketInsights.length} market insights`);
    }
  } catch (error) {
    console.log('   ⚠️  Error seeding market insights:', error.message);
  }
}

async function createArticleCompanyRelationships() {
  console.log('🔗 Creating article-company relationships...');
  
  try {
    // Get articles and companies
    const { data: articles } = await supabase
      .from('articles')
      .select('id, company_tickers');
    
    const { data: companies } = await supabase
      .from('company_tickers')
      .select('id, ticker');

    if (!articles || !companies) return;

    const relationships = [];
    
    for (const article of articles) {
      if (article.company_tickers) {
        for (const ticker of article.company_tickers) {
          const company = companies.find(c => c.ticker === ticker);
          if (company) {
            relationships.push({
              article_id: article.id,
              company_id: company.id,
              relevance_score: 0.8,
              mention_count: 1
            });
          }
        }
      }
    }

    if (relationships.length > 0) {
      const { error } = await supabase
        .from('article_companies')
        .insert(relationships);

      if (error) {
        console.log('   ⚠️  Article-company relationships may already exist:', error.message);
      } else {
        console.log(`   ✅ Created ${relationships.length} article-company relationships`);
      }
    }
  } catch (error) {
    console.log('   ⚠️  Error creating article-company relationships:', error.message);
  }
}

async function verifySeeding() {
  console.log('\n🔍 Verifying seeded data...');
  
  try {
    // Check news sources
    const { count: sourcesCount } = await supabase
      .from('news_sources')
      .select('*', { count: 'exact', head: true });
    console.log(`   📰 News sources: ${sourcesCount}`);

    // Check companies
    const { count: companiesCount } = await supabase
      .from('company_tickers')
      .select('*', { count: 'exact', head: true });
    console.log(`   🏢 Companies: ${companiesCount}`);

    // Check articles
    const { count: articlesCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });
    console.log(`   📄 Articles: ${articlesCount}`);

    // Check market insights
    const { count: insightsCount } = await supabase
      .from('market_insights')
      .select('*', { count: 'exact', head: true });
    console.log(`   💡 Market insights: ${insightsCount}`);

    console.log('\n✅ Data verification completed');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding for Financial News Analyzer App...\n');

  try {
    await seedNewsSources();
    await seedCompanies();
    await seedArticles();
    await seedMarketInsights();
    await createArticleCompanyRelationships();
    await verifySeeding();

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Your database now contains:');
    console.log('   • News sources for content aggregation');
    console.log('   • JSE and Junior Market company information');
    console.log('   • Sample articles with AI analysis');
    console.log('   • Market insights and analysis');
    console.log('   • Article-company relationships');

  } catch (error) {
    console.error('\n💥 Fatal error during database seeding:', error.message);
    process.exit(1);
  }
}

// Main execution
async function main() {
  console.log('🌱 Financial News Analyzer - Database Seeding');
  console.log('==========================================\n');

  await seedDatabase();
  
  console.log('\n🎯 Seeding complete! Your database is populated with sample data.');
  console.log('\n📱 You can now start your app and see the data in action!');
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the seeding
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { seedDatabase };
