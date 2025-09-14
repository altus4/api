/**
 * Search Response Types
 *
 * Types related to search results and responses.
 */

import type { OptimizationSuggestion, QuerySuggestion } from './suggestions';
import type { TrendInsight } from './analytics';

export interface SearchResult {
  /** Unique result ID */
  id: string;
  /** Table name where result was found */
  table: string;
  /** Database name where result was found */
  database: string;
  /** Relevance score for ranking */
  relevanceScore: number;
  /** List of columns that matched */
  matchedColumns: string[];
  /** Result data as key-value pairs */
  data: Record<string, any>;
  /** Optional snippet for preview */
  snippet?: string;
  /** Optional categories for result */
  categories?: string[];
}

export interface SearchResponse {
  /** Array of search results */
  results: SearchResult[];
  /** Array of result categories */
  categories: Category[];
  /** Array of query suggestions */
  suggestions: QuerySuggestion[];
  /** Optional search trends and insights */
  trends?: TrendInsight[];
  /** Optional query optimization suggestions */
  queryOptimization?: OptimizationSuggestion[];
  /** Total count of results */
  totalCount: number;
  /** Execution time in ms */
  executionTime: number;
  /** Current page number */
  page: number;
  /** Results per page */
  limit: number;
}

export interface Category {
  /** Category name */
  name: string;
  /** Number of results in category */
  count: number;
  /** Confidence score for category */
  confidence: number;
}
