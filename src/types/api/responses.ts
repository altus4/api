/**
 * API Response Types
 *
 * Types related to API responses and common response structures.
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: Date;
    requestId: string;
    version: string;
    apiKeyTier?: string;
  };
}
