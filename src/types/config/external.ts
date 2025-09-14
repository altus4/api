/**
 * External Configuration Types
 *
 * Types related to external service configurations and URL parsing.
 */

/**
 * Parsed database URL components
 */
export interface ParsedDatabaseUrl {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

/**
 * Parsed Redis URL components
 */
export interface ParsedRedisUrl {
  host: string;
  port: number;
  password?: string;
}

/**
 * Base configuration for external service proxies
 */
export interface ExternalProxyConfig {
  /** Default timeout for all API calls */
  defaultTimeout: number;
  /** Service name for error logging */
  serviceName: string;
  /** Custom timeout handler */
  onTimeout?: (error: any, operation: string) => void;
  /** Custom error handler */
  onError?: (error: unknown, operation: string) => void;
}

/**
 * Timeout error class for external service calls
 * Note: Implementation is in the external-proxy.ts file to avoid circular dependencies
 */
export interface TimeoutErrorInterface extends Error {
  readonly operation?: string;
  readonly timeoutMs?: number;
}
