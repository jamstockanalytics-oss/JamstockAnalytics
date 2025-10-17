/**
 * Production Logging Utility
 * Replaces console.log with proper logging for production
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private level: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.level = this.isProduction ? LogLevel.WARN : LogLevel.DEBUG;
  }

  debug(message: string, ...args: any[]) {
    if (this.level <= LogLevel.DEBUG && !this.isProduction) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (this.level <= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
      
      // In production, you might want to send to external logging service
      if (this.isProduction) {
        // TODO: Send to external logging service (e.g., Sentry, LogRocket)
      }
    }
  }
}

export const logger = new Logger();
export default logger;