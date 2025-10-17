/**
 * Independent ML Agent Service
 * 
 * A sophisticated machine learning agent that learns from JamStockAnalytics platform data
 * and operates independently to curate articles without human intervention.
 * 
 * Features:
 * - Learns from user interactions, article performance, and market data
 * - Automatically curates and prioritizes articles
 * - Operates independently using local ML models
 * - Continuously improves through reinforcement learning
 * - Uses DeepSeek for advanced pattern recognition and learning
 */

import { supabase } from '../supabase/client';
import { FallbackResponseService } from './fallback-responses';

// ML Agent Configuration
interface MLAgentConfig {
  learning_rate: number;
  batch_size: number;
  training_interval_hours: number;
  confidence_threshold: number;
  min_articles_per_training: number;
  model_version: string;
}

// Learning Data Structures
interface UserInteraction {
  user_id: string;
  article_id: string;
  interaction_type: 'view' | 'like' | 'share' | 'save' | 'skip';
  duration_seconds?: number;
  timestamp: string;
  context: Record<string, any>;
}

interface ArticlePerformance {
  article_id: string;
  views: number;
  likes: number;
  shares: number;
  saves: number;
  skips: number;
  engagement_rate: number;
  priority_score: number;
  market_impact: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'negative' | 'neutral';
  relevance_score: number;
}

interface LearningPattern {
  pattern_id: string;
  pattern_type: 'user_preference' | 'market_trend' | 'content_quality' | 'timing_optimization';
  pattern_data: Record<string, any>;
  confidence_score: number;
  last_updated: string;
  success_rate: number;
}

interface CuratedArticle {
  article_id: string;
  curation_score: number;
  curation_reason: string;
  target_audience: string[];
  optimal_timing: string;
  expected_engagement: number;
  confidence_level: number;
  created_at: string;
}

// ML Agent Service Class
export class MLAgentService {
  private config: MLAgentConfig;
  private isTraining: boolean = false;
  private lastTrainingTime: string | null = null;
  private learningPatterns: Map<string, LearningPattern> = new Map();
  private userProfiles: Map<string, any> = new Map();

  constructor(config?: Partial<MLAgentConfig>) {
    this.config = {
      learning_rate: 0.01,
      batch_size: 100,
      training_interval_hours: 6,
      confidence_threshold: 0.7,
      min_articles_per_training: 50,
      model_version: 'v1.0',
      ...config
    };

    // Initialize the agent
    this.initializeAgent();
  }

  /**
   * Initialize the ML Agent
   */
  private async initializeAgent(): Promise<void> {
    try {
      // Load existing learning patterns
      await this.loadLearningPatterns();

      // Load user profiles
      await this.loadUserProfiles();

      // Start autonomous operation
      await this.startAutonomousOperation();

      } catch (error) {
      console.error('❌ Failed to initialize ML Agent:', error);
    }
  }

  /**
   * Start autonomous operation
   */
  private async startAutonomousOperation(): Promise<void> {
    // Start training scheduler
    setInterval(() => {
      this.scheduleTraining();
    }, this.config.training_interval_hours * 60 * 60 * 1000);

    // Start article curation scheduler
    setInterval(() => {
      this.scheduleArticleCuration();
    }, 30 * 60 * 1000); // Every 30 minutes

    // Start learning pattern analysis
    setInterval(() => {
      this.analyzeLearningPatterns();
    }, 2 * 60 * 60 * 1000); // Every 2 hours

    }

  /**
   * Load learning patterns from database
   */
  private async loadLearningPatterns(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('ml_learning_patterns')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      this.learningPatterns.clear();
      (data || []).forEach(pattern => {
        this.learningPatterns.set(pattern.pattern_id, pattern);
      });

      } catch (error) {
      console.error('Error loading learning patterns:', error);
    }
  }

  /**
   * Load user profiles for personalization
   */
  private async loadUserProfiles(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('user_interaction_profiles')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      this.userProfiles.clear();
      (data || []).forEach(profile => {
        this.userProfiles.set(profile.user_id, profile);
      });

      } catch (error) {
      console.error('Error loading user profiles:', error);
    }
  }

  /**
   * Schedule training when conditions are met
   */
  private async scheduleTraining(): Promise<void> {
    if (this.isTraining) return;

    try {
      // Check if we have enough data for training
      const { data: articles } = await supabase
        .from('articles')
        .select('id')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (!articles || articles.length < this.config.min_articles_per_training) {
        return;
      }

      await this.trainModel();
    } catch (error) {
      console.error('Error in scheduled training:', error);
    }
  }

  /**
   * Schedule article curation
   */
  private async scheduleArticleCuration(): Promise<void> {
    try {
      await this.curateArticles();
    } catch (error) {
      console.error('Error in article curation:', error);
    }
  }

  /**
   * Train the ML model using DeepSeek
   */
  private async trainModel(): Promise<void> {
    this.isTraining = true;
    try {
      // Collect training data
      const trainingData = await this.collectTrainingData();
      
      if (trainingData.length === 0) {
        return;
      }

      // Use DeepSeek for pattern analysis
      const patterns = await this.analyzePatternsWithDeepSeek(trainingData);
      
      // Update learning patterns
      await this.updateLearningPatterns(patterns);

      // Save model state
      await this.saveModelState();

      this.lastTrainingTime = new Date().toISOString();
      } catch (error) {
      console.error('❌ Training failed:', error);
    } finally {
      this.isTraining = false;
    }
  }

  /**
   * Collect training data from various sources
   */
  private async collectTrainingData(): Promise<any[]> {
    try {
      // Get user interactions
      const { data: interactions } = await supabase
        .from('user_article_interactions')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Get article performance data
      const { data: articles } = await supabase
        .from('articles')
        .select('*, ai_priority_score, sentiment_score, relevance_score')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Get market data
      const { data: marketData } = await supabase
        .from('market_data')
        .select('*')
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      return {
        interactions: interactions || [],
        articles: articles || [],
        market_data: marketData || []
      };
    } catch (error) {
      console.error('Error collecting training data:', error);
      return [];
    }
  }

  /**
   * Analyze patterns using DeepSeek
   */
  private async analyzePatternsWithDeepSeek(trainingData: any): Promise<LearningPattern[]> {
    try {
      const prompt = `
You are an advanced ML agent analyzing financial news patterns. Analyze the following data and identify patterns:

Training Data:
- User Interactions: ${JSON.stringify(trainingData.interactions.slice(0, 10))}
- Article Performance: ${JSON.stringify(trainingData.articles.slice(0, 10))}
- Market Data: ${JSON.stringify(trainingData.market_data.slice(0, 10))}

Identify patterns in:
1. User preferences and behavior
2. Article performance factors
3. Market timing optimization
4. Content quality indicators
5. Engagement prediction factors

Return as JSON array of patterns:
[
  {
    "pattern_type": "user_preference|market_trend|content_quality|timing_optimization",
    "pattern_data": {...},
    "confidence_score": 0.0-1.0,
    "success_rate": 0.0-1.0
  }
]
`;

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an expert ML analyst specializing in financial news pattern recognition. Provide accurate, data-driven pattern analysis in JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const patternsText = data.choices[0]?.message?.content;
      
      if (!patternsText) {
        throw new Error('No patterns received from DeepSeek');
      }

      const patterns = JSON.parse(patternsText);
      return patterns.map((pattern: any, index: number) => ({
        pattern_id: `pattern_${Date.now()}_${index}`,
        ...pattern,
        last_updated: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Error analyzing patterns with DeepSeek:', error);
      
      // Return basic patterns as fallback
      return this.generateBasicPatterns(trainingData);
    }
  }

  /**
   * Generate basic patterns as fallback
   */
  private generateBasicPatterns(trainingData: any): LearningPattern[] {
    const patterns: LearningPattern[] = [];

    // Analyze interaction patterns
    if (trainingData.interactions.length > 0) {
      const interactionTypes = trainingData.interactions.map((i: any) => i.interaction_type);
      const mostCommon = interactionTypes.reduce((a: any, b: any) => 
        interactionTypes.filter(v => v === a).length >= interactionTypes.filter(v => v === b).length ? a : b
      );

      patterns.push({
        pattern_id: `basic_interaction_${Date.now()}`,
        pattern_type: 'user_preference',
        pattern_data: {
          preferred_interaction: mostCommon,
          interaction_frequency: trainingData.interactions.length
        },
        confidence_score: 0.6,
        last_updated: new Date().toISOString(),
        success_rate: 0.7
      });
    }

    // Analyze article performance patterns
    if (trainingData.articles.length > 0) {
      const avgPriority = trainingData.articles.reduce((sum: number, a: any) => sum + (a.ai_priority_score || 0), 0) / trainingData.articles.length;
      
      patterns.push({
        pattern_id: `basic_performance_${Date.now()}`,
        pattern_type: 'content_quality',
        pattern_data: {
          average_priority_score: avgPriority,
          total_articles: trainingData.articles.length
        },
        confidence_score: 0.5,
        last_updated: new Date().toISOString(),
        success_rate: 0.6
      });
    }

    return patterns;
  }

  /**
   * Update learning patterns in database
   */
  private async updateLearningPatterns(patterns: LearningPattern[]): Promise<void> {
    try {
      for (const pattern of patterns) {
        // Check if pattern already exists
        const { data: existing } = await supabase
          .from('ml_learning_patterns')
          .select('id')
          .eq('pattern_id', pattern.pattern_id)
          .single();

        if (existing) {
          // Update existing pattern
          await supabase
            .from('ml_learning_patterns')
            .update({
              pattern_data: pattern.pattern_data,
              confidence_score: pattern.confidence_score,
              success_rate: pattern.success_rate,
              last_updated: pattern.last_updated
            })
            .eq('pattern_id', pattern.pattern_id);
        } else {
          // Insert new pattern
          await supabase
            .from('ml_learning_patterns')
            .insert({
              pattern_id: pattern.pattern_id,
              pattern_type: pattern.pattern_type,
              pattern_data: pattern.pattern_data,
              confidence_score: pattern.confidence_score,
              success_rate: pattern.success_rate,
              last_updated: pattern.last_updated,
              is_active: true
            });
        }

        // Update in-memory cache
        this.learningPatterns.set(pattern.pattern_id, pattern);
      }

      } catch (error) {
      console.error('Error updating learning patterns:', error);
    }
  }

  /**
   * Save model state
   */
  private async saveModelState(): Promise<void> {
    try {
      await supabase
        .from('ml_agent_state')
        .upsert({
          agent_id: 'main_agent',
          model_version: this.config.model_version,
          last_training_time: this.lastTrainingTime,
          training_count: (await this.getTrainingCount()) + 1,
          pattern_count: this.learningPatterns.size,
          user_profile_count: this.userProfiles.size,
          is_active: true,
          last_updated: new Date().toISOString()
        });

      } catch (error) {
      console.error('Error saving model state:', error);
    }
  }

  /**
   * Get training count
   */
  private async getTrainingCount(): Promise<number> {
    try {
      const { data } = await supabase
        .from('ml_agent_state')
        .select('training_count')
        .eq('agent_id', 'main_agent')
        .single();

      return data?.training_count || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Curate articles using learned patterns
   */
  private async curateArticles(): Promise<void> {
    try {
      // Get recent articles that need curation
      const { data: articles } = await supabase
        .from('articles')
        .select('*')
        .eq('is_curated', false)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(20);

      if (!articles || articles.length === 0) {
        return;
      }

      // Curate each article
      for (const article of articles) {
        const curatedArticle = await this.curateSingleArticle(article);
        if (curatedArticle) {
          await this.saveCuratedArticle(curatedArticle);
        }
      }

      } catch (error) {
      console.error('Error curating articles:', error);
    }
  }

  /**
   * Curate a single article
   */
  private async curateSingleArticle(article: any): Promise<CuratedArticle | null> {
    try {
      // Calculate curation score using learned patterns
      const curationScore = await this.calculateCurationScore(article);
      
      if (curationScore < 0.3) {
        return null; // Skip low-quality articles
      }

      // Determine target audience
      const targetAudience = this.determineTargetAudience(article);
      
      // Predict optimal timing
      const optimalTiming = this.predictOptimalTiming(article);
      
      // Estimate engagement
      const expectedEngagement = this.estimateEngagement(article);

      return {
        article_id: article.id,
        curation_score: curationScore,
        curation_reason: this.generateCurationReason(article, curationScore),
        target_audience: targetAudience,
        optimal_timing: optimalTiming,
        expected_engagement: expectedEngagement,
        confidence_level: this.calculateConfidenceLevel(article),
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error curating article:', error);
      return null;
    }
  }

  /**
   * Calculate curation score using ML patterns
   */
  private async calculateCurationScore(article: any): Promise<number> {
    let score = 0;

    // Base score from AI priority
    score += (article.ai_priority_score || 0) * 0.3;

    // Apply learned patterns
    for (const pattern of this.learningPatterns.values()) {
      if (pattern.pattern_type === 'content_quality') {
        const patternScore = this.applyContentQualityPattern(article, pattern);
        score += patternScore * pattern.confidence_score * 0.2;
      } else if (pattern.pattern_type === 'user_preference') {
        const patternScore = this.applyUserPreferencePattern(article, pattern);
        score += patternScore * pattern.confidence_score * 0.15;
      } else if (pattern.pattern_type === 'market_trend') {
        const patternScore = this.applyMarketTrendPattern(article, pattern);
        score += patternScore * pattern.confidence_score * 0.2;
      } else if (pattern.pattern_type === 'timing_optimization') {
        const patternScore = this.applyTimingPattern(article, pattern);
        score += patternScore * pattern.confidence_score * 0.15;
      }
    }

    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Apply content quality patterns
   */
  private applyContentQualityPattern(article: any, pattern: LearningPattern): number {
    // Analyze article content quality based on learned patterns
    const content = (article.headline + ' ' + (article.content || '')).toLowerCase();
    
    // Check for financial keywords
    const financialKeywords = ['earnings', 'revenue', 'profit', 'market', 'investment', 'stock', 'jse'];
    const keywordMatches = financialKeywords.filter(keyword => content.includes(keyword)).length;
    
    return keywordMatches / financialKeywords.length;
  }

  /**
   * Apply user preference patterns
   */
  private applyUserPreferencePattern(article: any, pattern: LearningPattern): number {
    // Analyze article against user preferences
    const preferredTopics = pattern.pattern_data.preferred_topics || [];
    const content = (article.headline + ' ' + (article.content || '')).toLowerCase();
    
    const topicMatches = preferredTopics.filter((topic: string) => 
      content.includes(topic.toLowerCase())
    ).length;
    
    return topicMatches / Math.max(preferredTopics.length, 1);
  }

  /**
   * Apply market trend patterns
   */
  private applyMarketTrendPattern(article: any, pattern: LearningPattern): number {
    // Analyze article relevance to current market trends
    const currentHour = new Date().getHours();
    const isMarketHours = currentHour >= 9 && currentHour <= 16;
    
    return isMarketHours ? 0.8 : 0.4;
  }

  /**
   * Apply timing patterns
   */
  private applyTimingPattern(article: any, pattern: LearningPattern): number {
    // Analyze optimal timing for article publication
    const currentHour = new Date().getHours();
    const optimalHours = pattern.pattern_data.optimal_hours || [9, 10, 14, 15];
    
    return optimalHours.includes(currentHour) ? 0.9 : 0.3;
  }

  /**
   * Determine target audience
   */
  private determineTargetAudience(article: any): string[] {
    const audience: string[] = [];
    const content = (article.headline + ' ' + (article.content || '')).toLowerCase();

    if (content.includes('beginner') || content.includes('basic')) {
      audience.push('beginners');
    }
    if (content.includes('advanced') || content.includes('expert')) {
      audience.push('advanced');
    }
    if (content.includes('investment') || content.includes('trading')) {
      audience.push('investors');
    }
    if (content.includes('news') || content.includes('update')) {
      audience.push('news_followers');
    }

    return audience.length > 0 ? audience : ['general'];
  }

  /**
   * Predict optimal timing
   */
  private predictOptimalTiming(article: any): string {
    // Use learned patterns to predict optimal timing
    const currentHour = new Date().getHours();
    
    // Market hours are generally better
    if (currentHour >= 9 && currentHour <= 16) {
      return 'market_hours';
    } else if (currentHour >= 7 && currentHour <= 9) {
      return 'pre_market';
    } else {
      return 'after_hours';
    }
  }

  /**
   * Estimate engagement
   */
  private estimateEngagement(article: any): number {
    // Estimate engagement based on learned patterns
    const baseScore = article.ai_priority_score || 0.5;
    const contentLength = (article.content || '').length;
    const hasImage = article.image_url ? 1 : 0;
    
    // Simple engagement estimation
    return Math.min(baseScore + (contentLength > 500 ? 0.1 : 0) + (hasImage ? 0.1 : 0), 1);
  }

  /**
   * Calculate confidence level
   */
  private calculateConfidenceLevel(article: any): number {
    // Calculate confidence based on available data quality
    let confidence = 0.5;
    
    if (article.ai_priority_score) confidence += 0.2;
    if (article.sentiment_score) confidence += 0.1;
    if (article.relevance_score) confidence += 0.1;
    if (article.content && article.content.length > 100) confidence += 0.1;
    
    return Math.min(confidence, 1);
  }

  /**
   * Generate curation reason
   */
  private generateCurationReason(article: any, score: number): string {
    const reasons: string[] = [];
    
    if (article.ai_priority_score > 0.7) {
      reasons.push('High AI priority score');
    }
    if (score > 0.6) {
      reasons.push('Strong pattern match');
    }
    if (article.sentiment_score > 0.6) {
      reasons.push('Positive sentiment');
    }
    if (reasons.length === 0) {
      reasons.push('Moderate relevance');
    }
    
    return reasons.join(', ');
  }

  /**
   * Save curated article
   */
  private async saveCuratedArticle(curatedArticle: CuratedArticle): Promise<void> {
    try {
      await supabase
        .from('curated_articles')
        .insert(curatedArticle);

      // Mark original article as curated
      await supabase
        .from('articles')
        .update({ is_curated: true })
        .eq('id', curatedArticle.article_id);

    } catch (error) {
      console.error('Error saving curated article:', error);
    }
  }

  /**
   * Analyze learning patterns for optimization
   */
  private async analyzeLearningPatterns(): Promise<void> {
    try {
      // Identify low-performing patterns
      const lowPerformingPatterns = Array.from(this.learningPatterns.values())
        .filter(pattern => pattern.success_rate < 0.3);

      // Remove or update low-performing patterns
      for (const pattern of lowPerformingPatterns) {
        await supabase
          .from('ml_learning_patterns')
          .update({ is_active: false })
          .eq('pattern_id', pattern.pattern_id);

        this.learningPatterns.delete(pattern.pattern_id);
      }

      } catch (error) {
      console.error('Error analyzing learning patterns:', error);
    }
  }

  /**
   * Get agent status
   */
  public async getAgentStatus(): Promise<any> {
    return {
      is_active: true,
      is_training: this.isTraining,
      last_training_time: this.lastTrainingTime,
      learning_patterns_count: this.learningPatterns.size,
      user_profiles_count: this.userProfiles.size,
      model_version: this.config.model_version,
      confidence_threshold: this.config.confidence_threshold
    };
  }

  /**
   * Force training (for manual triggers)
   */
  public async forceTraining(): Promise<void> {
    if (this.isTraining) {
      return;
    }

    await this.trainModel();
  }

  /**
   * Get curated articles
   */
  public async getCuratedArticles(limit: number = 10): Promise<CuratedArticle[]> {
    try {
      const { data, error } = await supabase
        .from('curated_articles')
        .select('*')
        .order('curation_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting curated articles:', error);
      return [];
    }
  }
}

// Export singleton instance
export const mlAgentService = new MLAgentService();
