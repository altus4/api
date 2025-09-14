/**
 * API Key Types
 *
 * Types related to API keys, authentication, and usage tracking.
 */

export interface ApiKey {
  id: string;
  userId: string;
  keyPrefix: string;
  name: string;
  environment: 'test' | 'live';
  permissions: string[];
  rateLimitTier: 'free' | 'pro' | 'enterprise';
  rateLimitCustom?: Record<string, any>;
  expiresAt?: Date;
  lastUsed?: Date;
  lastUsedIp?: string;
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApiKeyRequest {
  userId: string;
  name: string;
  environment: 'test' | 'live';
  permissions?: string[];
  rateLimitTier?: 'free' | 'pro' | 'enterprise';
  rateLimitCustom?: Record<string, any>;
  expiresAt?: Date;
}

export interface ApiKeyUsage {
  apiKeyId: string;
  requestCount: number;
  lastUsed: Date;
  rateLimitStatus: {
    tier: string;
    remaining: number;
    resetTime: Date;
  };
}
