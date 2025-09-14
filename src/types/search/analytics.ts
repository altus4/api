/**
 * Search Analytics Types
 *
 * Types related to search analytics, trends, and insights.
 */

export interface SearchAnalytics {
  id: string;
  userId: string;
  query: string;
  database: string;
  executionTime: number;
  resultCount: number;
  clickedResults?: string[];
  satisfaction?: number;
  timestamp: Date;
}

export interface TrendInsight {
  period: 'day' | 'week' | 'month' | '3months' | '6months' | 'year';
  topQueries: string[];
  queryVolume: number;
  avgResponseTime: number;
  popularCategories: string[];
}
