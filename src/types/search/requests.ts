/**
 * Search Request Types
 *
 * Types related to search requests and queries.
 */

export interface SearchRequest {
  /** Search query string */
  query: string;
  /** List of database IDs to search */
  databases?: string[];
  /** List of table names to search */
  tables?: string[];
  /** List of column names to search */
  columns?: string[];
  /** Optional filters for search */
  filters?: Record<string, any>;
  /** Search mode: natural, boolean, or semantic */
  searchMode?: 'natural' | 'boolean' | 'semantic';
  /** Result limit per page */
  limit?: number;
  /** Result offset for pagination */
  offset?: number;
  /** Whether to include analytics in response */
  includeAnalytics?: boolean;
  /** User ID of the requester */
  userId: string;
}
