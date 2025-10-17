import { supabase } from '../supabase/client';

export interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
  buckets: {
    id: string;
    name: string;
    owner: string;
    created_at: string;
    updated_at: string;
    public: boolean;
  };
}

export interface UploadOptions {
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
}

export interface DownloadOptions {
  transform?: {
    width?: number;
    height?: number;
    resize?: 'cover' | 'contain' | 'fill';
    quality?: number;
  };
}

/**
 * Storage Service for managing Supabase storage buckets
 * Provides easy access to scraped data and user files
 */
export class StorageService {
  private bucketName: string;

  constructor(bucketName: string) {
    this.bucketName = bucketName;
  }

  /**
   * Upload a file to the storage bucket
   */
  async uploadFile(
    path: string,
    file: File | Blob,
    options: UploadOptions = {}
  ): Promise<{ data: StorageFile | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(path, file, {
          cacheControl: options.cacheControl || '3600',
          contentType: options.contentType,
          upsert: options.upsert || false,
        });

      if (error) {
        return { data: null, error };
      }

      return { data: data as StorageFile, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Download a file from the storage bucket
   */
  async downloadFile(
    path: string,
    options: DownloadOptions = {}
  ): Promise<{ data: Blob | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .download(path, options.transform);

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get a public URL for a file
   */
  getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * List files in a folder
   */
  async listFiles(
    folder: string = '',
    limit: number = 100,
    offset: number = 0
  ): Promise<{ data: StorageFile[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(folder, {
          limit,
          offset,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        return { data: null, error };
      }

      return { data: data as StorageFile[], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(path: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path]);

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Move or rename a file
   */
  async moveFile(
    fromPath: string,
    toPath: string
  ): Promise<{ data: StorageFile | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .move(fromPath, toPath);

      if (error) {
        return { data: null, error };
      }

      return { data: data as StorageFile, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Copy a file
   */
  async copyFile(
    fromPath: string,
    toPath: string
  ): Promise<{ data: StorageFile | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .copy(fromPath, toPath);

      if (error) {
        return { data: null, error };
      }

      return { data: data as StorageFile, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}

/**
 * Pre-configured storage services for different data types
 */
export const newsStorage = new StorageService('news-articles');
export const marketStorage = new StorageService('market-data');
export const userStorage = new StorageService('user-uploads');
export const aiStorage = new StorageService('ai-analysis');
export const companyStorage = new StorageService('company-data');
export const backupStorage = new StorageService('backup-data');

/**
 * News Articles Storage Helper
 */
export class NewsStorageService {
  private storage = newsStorage;

  /**
   * Store scraped article content
   */
  async storeArticle(
    articleId: string,
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<{ data: StorageFile | null; error: Error | null }> {
    const path = `processed-articles/${articleId}.json`;
    const articleData = {
      id: articleId,
      content,
      metadata,
      scraped_at: new Date().toISOString(),
      ...metadata
    };

    return this.storage.uploadFile(
      path,
      new Blob([JSON.stringify(articleData, null, 2)], { type: 'application/json' }),
      { contentType: 'application/json' }
    );
  }

  /**
   * Store raw scraped HTML
   */
  async storeRawArticle(
    articleId: string,
    htmlContent: string,
    source: string
  ): Promise<{ data: StorageFile | null; error: Error | null }> {
    const path = `raw-articles/${source}/${articleId}.html`;
    
    return this.storage.uploadFile(
      path,
      new Blob([htmlContent], { type: 'text/html' }),
      { contentType: 'text/html' }
    );
  }

  /**
   * Get article content
   */
  async getArticle(articleId: string): Promise<{ data: any | null; error: Error | null }> {
    const path = `processed-articles/${articleId}.json`;
    const { data, error } = await this.storage.downloadFile(path);

    if (error) {
      return { data: null, error };
    }

    try {
      const content = await data!.text();
      return { data: JSON.parse(content), error: null };
    } catch (parseError) {
      return { data: null, error: parseError as Error };
    }
  }

  /**
   * Archive old articles
   */
  async archiveArticle(articleId: string): Promise<{ error: Error | null }> {
    const fromPath = `processed-articles/${articleId}.json`;
    const toPath = `archives/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${articleId}.json`;
    
    const { error } = await this.storage.moveFile(fromPath, toPath);
    return { error };
  }
}

/**
 * Market Data Storage Helper
 */
export class MarketStorageService {
  private storage = marketStorage;

  /**
   * Store daily market data
   */
  async storeDailyData(
    date: string,
    data: Record<string, any>
  ): Promise<{ data: StorageFile | null; error: Error | null }> {
    const path = `daily-data/${date}.json`;
    
    return this.storage.uploadFile(
      path,
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      { contentType: 'application/json' }
    );
  }

  /**
   * Store historical market data
   */
  async storeHistoricalData(
    symbol: string,
    data: Record<string, any>[]
  ): Promise<{ data: StorageFile | null; error: Error | null }> {
    const path = `historical-data/${symbol}.json`;
    
    return this.storage.uploadFile(
      path,
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      { contentType: 'application/json' }
    );
  }

  /**
   * Store chart data
   */
  async storeChartData(
    chartId: string,
    chartData: Record<string, any>
  ): Promise<{ data: StorageFile | null; error: Error | null }> {
    const path = `charts/${chartId}.json`;
    
    return this.storage.uploadFile(
      path,
      new Blob([JSON.stringify(chartData, null, 2)], { type: 'application/json' }),
      { contentType: 'application/json' }
    );
  }

  /**
   * Get market data
   */
  async getMarketData(path: string): Promise<{ data: any | null; error: Error | null }> {
    const { data, error } = await this.storage.downloadFile(path);

    if (error) {
      return { data: null, error };
    }

    try {
      const content = await data!.text();
      return { data: JSON.parse(content), error: null };
    } catch (parseError) {
      return { data: null, error: parseError as Error };
    }
  }
}

/**
 * AI Analysis Storage Helper
 */
export class AIAnalysisStorageService {
  private storage = aiStorage;

  /**
   * Store AI analysis results
   */
  async storeAnalysis(
    analysisId: string,
    analysisData: Record<string, any>
  ): Promise<{ data: StorageFile | null; error: Error | null }> {
    const path = `insights/${analysisId}.json`;
    
    return this.storage.uploadFile(
      path,
      new Blob([JSON.stringify(analysisData, null, 2)], { type: 'application/json' }),
      { contentType: 'application/json' }
    );
  }

  /**
   * Store sentiment analysis
   */
  async storeSentimentAnalysis(
    date: string,
    sentimentData: Record<string, any>
  ): Promise<{ data: StorageFile | null; error: Error | null }> {
    const path = `sentiment-analysis/${date}.json`;
    
    return this.storage.uploadFile(
      path,
      new Blob([JSON.stringify(sentimentData, null, 2)], { type: 'application/json' }),
      { contentType: 'application/json' }
    );
  }

  /**
   * Store risk reports
   */
  async storeRiskReport(
    reportId: string,
    riskData: Record<string, any>
  ): Promise<{ data: StorageFile | null; error: Error | null }> {
    const path = `risk-reports/${reportId}.json`;
    
    return this.storage.uploadFile(
      path,
      new Blob([JSON.stringify(riskData, null, 2)], { type: 'application/json' }),
      { contentType: 'application/json' }
    );
  }
}

/**
 * User Storage Helper
 */
export class UserStorageService {
  private storage = userStorage;

  /**
   * Upload user document
   */
  async uploadDocument(
    userId: string,
    fileName: string,
    file: File | Blob
  ): Promise<{ data: StorageFile | null; error: Error | null }> {
    const path = `documents/${userId}/${fileName}`;
    
    return this.storage.uploadFile(path, file);
  }

  /**
   * Upload user image
   */
  async uploadImage(
    userId: string,
    fileName: string,
    file: File | Blob
  ): Promise<{ data: StorageFile | null; error: Error | null }> {
    const path = `images/${userId}/${fileName}`;
    
    return this.storage.uploadFile(path, file);
  }

  /**
   * Export user data
   */
  async exportUserData(
    userId: string,
    data: Record<string, any>
  ): Promise<{ data: StorageFile | null; error: Error | null }> {
    const path = `exports/${userId}/user-data-${new Date().toISOString().split('T')[0]}.json`;
    
    return this.storage.uploadFile(
      path,
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      { contentType: 'application/json' }
    );
  }

  /**
   * Get user files
   */
  async getUserFiles(userId: string): Promise<{ data: StorageFile[] | null; error: Error | null }> {
    return this.storage.listFiles(`documents/${userId}`);
  }
}

// Export all services
export const newsStorageService = new NewsStorageService();
export const marketStorageService = new MarketStorageService();
export const aiAnalysisStorageService = new AIAnalysisStorageService();
export const userStorageService = new UserStorageService();
