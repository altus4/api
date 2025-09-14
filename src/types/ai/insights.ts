/**
 * AI Insights Types
 *
 * Types related to AI-powered insights and enhancements.
 */

export interface AIInsight {
  type: 'query_optimization' | 'trend_analysis' | 'semantic_enhancement';
  confidence: number;
  description: string;
  actionable: boolean;
  data: Record<string, any>;
}
