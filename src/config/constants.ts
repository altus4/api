/**
 * Application Constants
 *
 * Centralized constants to avoid magic numbers and improve maintainability.
 * These constants are used across the application for ports, timeouts, limits, etc.
 */

// Network Ports
export const PORTS = {
  DEFAULT_HTTP: 3000,
  DEFAULT_MYSQL: 3306,
  DEFAULT_REDIS: 6379,

  // Development server ports
  VITE_DEV: 5173,
  VITE_DEV_ALT: 5174,
  VITE_PREVIEW: 4173,
  REACT_DEV: 3000,
  REACT_DEV_ALT: 3001,
  VUE_CLI: 8080,
} as const;

// HTTP Status Codes (commonly used ones not already covered by standard libraries)
export const HTTP_STATUS = {
  // Success codes
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Client error codes
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server error codes
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// File and Memory Limits
export const LIMITS = {
  REQUEST_BODY_SIZE: '10mb',
  LOG_FILE_SIZE: 5242880, // 5MB
  LOG_FILE_COUNT: 5,
  CONNECTION_POOL_SIZE: 5,
  QUEUE_LIMIT: 0,
  MAX_LINE_LENGTH: 120,
  MAX_FUNCTION_LINES: 50,
  PORT_RANGE_MIN: 1,
  PORT_RANGE_MAX: 65535,
} as const;

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  OPENAI_DEFAULT: 30000, // 30 seconds
  DATABASE_TEST: 10000, // 10 seconds
} as const;

// JWT Token Lengths
export const JWT_MIN_LENGTH = {
  PRODUCTION: 32,
  TEST: 16,
} as const;

// Default Database Configuration
export const DATABASE_DEFAULTS = {
  CHARSET: 'utf8mb4_general_ci',
  WAIT_FOR_CONNECTIONS: true,
  MULTIPLE_STATEMENTS: true,
} as const;

// CORS Configuration
export const CORS_ORIGINS = {
  LOCALHOST_PORTS: [
    PORTS.VITE_DEV,
    PORTS.VITE_DEV_ALT,
    PORTS.REACT_DEV,
    PORTS.REACT_DEV_ALT,
    PORTS.VITE_PREVIEW,
    PORTS.VUE_CLI,
  ],
  LOCALHOST_127: [PORTS.VITE_DEV_ALT, PORTS.REACT_DEV],
} as const;
