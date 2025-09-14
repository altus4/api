/**
 * Type Definitions
 *
 * Centralized re-exports for all application types organized by domain.
 * This provides a single entry point while maintaining organized structure.
 *
 * Usage:
 *   - Import specific types: `import { SearchRequest, ApiResponse } from '@/types'`
 *   - Import domain types: `import { DatabaseConnection } from '@/types/database'`
 */

// Authentication types
export * from './auth';

// Database types
export * from './database';

// Search types
export * from './search';

// API types
export * from './api';

// Configuration types
export * from './config';

// AI types
export * from './ai';
