/**
 * Database Schema Types
 *
 * Types related to database schema discovery, table structure, and indexes.
 */

export interface TableSchema {
  database: string;
  table: string;
  columns: ColumnInfo[];
  fullTextIndexes: FullTextIndex[];
  estimatedRows: number;
  lastAnalyzed: Date;
}

export interface ColumnInfo {
  name: string;
  type: string;
  isFullTextIndexed: boolean;
  isSearchable: boolean;
  dataPreview?: string[];
}

export interface FullTextIndex {
  name: string;
  columns: string[];
  type: 'FULLTEXT';
  cardinality?: number;
}
