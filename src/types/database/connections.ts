/**
 * Database Connection Types
 *
 * Types related to database connections, configuration, and pool management.
 */

export interface DatabaseConnection {
  /** Unique identifier for the connection */
  id: string;
  /** Human-readable name for the connection */
  name: string;
  /** Hostname or IP address of the database */
  host: string;
  /** Port number for the database */
  port: number;
  /** Database name */
  database: string;
  /** Username for authentication */
  username: string;
  /** Password (encrypted in storage) */
  password: string; // Will be encrypted in storage
  /** Whether SSL is enabled */
  ssl?: boolean;
  /** Timestamp when created */
  createdAt: Date;
  /** Timestamp when updated */
  updatedAt: Date;
  /** Whether the connection is active */
  isActive: boolean;
}

/**
 * Database connection type for API responses (without password)
 */
export type DatabaseConnectionResponse = Omit<DatabaseConnection, 'password'>;

/**
 * Database connection pool configuration
 */
export interface ConnectionPoolConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
  acquireTimeout: number;
  timeout: number;
  reconnect: boolean;
  ssl?: string | boolean;
}
