/**
 * Search Suggestions Types
 *
 * Types related to search suggestions and query optimization.
 */

export interface QuerySuggestion {
  /** Suggested query text */
  text: string;
  /** Score for suggestion relevance */
  score: number;
  /** Type of suggestion */
  type: 'spelling' | 'semantic' | 'popular';
}

export interface OptimizationSuggestion {
  type: 'index' | 'query' | 'schema';
  description: string;
  impact: 'low' | 'medium' | 'high';
  sqlSuggestion?: string;
}
