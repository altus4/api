/**
 * Application Configuration Types
 *
 * Types related to application configuration and settings.
 */

export interface AppConfig {
  port: number;
  environment: 'development' | 'production' | 'test';
  jwtSecret: string;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  openai: {
    apiKey: string;
    model: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  timeout: {
    openai: number;
  };
}
