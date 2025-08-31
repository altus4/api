import type { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';
import mysql from 'mysql2/promise';
import { logger } from '@/utils/logger';
import type { ColumnInfo, DatabaseConnection, FullTextIndex, TableSchema } from '@/types';

export class DatabaseService {
  private connections: Map<string, Pool> = new Map();
  private readonly maxConnections = 5; // Per database
  private readonly acquireTimeout = 60000; // 60 seconds
  private readonly connectionTimeout = 60000; // 60 seconds

  /**
   * Add a new database connection to the pool
   */
  public async addConnection(dbConfig: DatabaseConnection): Promise<void> {
    try {
      const poolConfig: any = {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        connectionLimit: this.maxConnections,
        acquireTimeout: this.acquireTimeout,
        timeout: this.connectionTimeout,
        reconnect: true,
      };

      // Add SSL configuration only if needed
      if (dbConfig.ssl === true) {
        poolConfig.ssl = 'Amazon RDS';
      } else if (typeof dbConfig.ssl === 'string') {
        poolConfig.ssl = dbConfig.ssl;
      }

      const pool = mysql.createPool(poolConfig);

      // Test the connection
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();

      this.connections.set(dbConfig.id, pool);
      logger.info(`Database connection added: ${dbConfig.name} (${dbConfig.id})`);
    } catch (error) {
      logger.error(`Failed to add database connection ${dbConfig.name}:`, error);
      throw new Error(
        `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Remove a database connection from the pool
   */
  public async removeConnection(connectionId: string): Promise<void> {
    const pool = this.connections.get(connectionId);
    if (pool) {
      await pool.end();
      this.connections.delete(connectionId);
      logger.info(`Database connection removed: ${connectionId}`);
    }
  }

  /**
   * Get a connection from the pool
   */
  private async getConnection(connectionId: string): Promise<PoolConnection> {
    const pool = this.connections.get(connectionId);
    if (!pool) {
      throw new Error(`Database connection not found: ${connectionId}`);
    }

    try {
      return await pool.getConnection();
    } catch (error) {
      logger.error(`Failed to get connection for ${connectionId}:`, error);
      throw error;
    }
  }

  /**
   * Test database connection
   */
  public async testConnection(connectionId: string): Promise<boolean> {
    try {
      const connection = await this.getConnection(connectionId);
      await connection.ping();
      connection.release();
      return true;
    } catch (error) {
      logger.error(`Connection test failed for ${connectionId}:`, error);
      return false;
    }
  }

  /**
   * Discover table schemas and full-text indexes
   */
  public async discoverSchema(connectionId: string): Promise<TableSchema[]> {
    const connection = await this.getConnection(connectionId);

    try {
      // Get all tables
      const [tables] = await connection.execute<RowDataPacket[]>('SHOW TABLES');

      const schemas: TableSchema[] = [];

      for (const tableRow of tables) {
        const tableName = Object.values(tableRow)[0] as string;

        // Get column information
        const [columns] = await connection.execute<RowDataPacket[]>('DESCRIBE ??', [tableName]);

        // Get full-text indexes
        const [indexes] = await connection.execute<RowDataPacket[]>(
          'SHOW INDEX FROM ?? WHERE Index_type = ?',
          [tableName, 'FULLTEXT']
        );

        // Get estimated row count
        const [rowCount] = await connection.execute<RowDataPacket[]>(
          'SELECT TABLE_ROWS FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
          [tableName]
        );

        const columnInfo: ColumnInfo[] = columns.map(col => ({
          name: col.Field,
          type: col.Type,
          isFullTextIndexed: indexes.some(idx => idx.Column_name === col.Field),
          isSearchable: this.isColumnSearchable(col.Type),
        }));

        const fullTextIndexes: FullTextIndex[] = this.groupIndexesByName(indexes);

        schemas.push({
          database: connection.config.database || 'unknown',
          table: tableName,
          columns: columnInfo,
          fullTextIndexes,
          estimatedRows: rowCount[0]?.TABLE_ROWS || 0,
          lastAnalyzed: new Date(),
        });
      }

      return schemas;
    } finally {
      connection.release();
    }
  }

  /**
   * Execute full-text search query
   */
  public async executeFullTextSearch(
    connectionId: string,
    query: string,
    tables: string[],
    columns?: string[],
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    const connection = await this.getConnection(connectionId);

    try {
      const searchQueries: string[] = [];
      const searchParams: any[] = [];

      for (const table of tables) {
        // Get full-text indexed columns for this table
        const [indexes] = await connection.execute<RowDataPacket[]>(
          'SHOW INDEX FROM ?? WHERE Index_type = ?',
          [table, 'FULLTEXT']
        );

        if (indexes.length === 0) {
          logger.warn(`No full-text indexes found for table: ${table}`);
          continue;
        }

        // Group columns by index name
        const indexGroups = this.groupIndexesByName(indexes);

        for (const index of indexGroups) {
          const columnsToSearch = columns
            ? index.columns.filter(col => columns.includes(col))
            : index.columns;

          if (columnsToSearch.length === 0) {
            continue;
          }

          const columnList = columnsToSearch.join(', ');
          const selectColumns = columnsToSearch.map(col => `${col}`).join(', ');

          const searchQuery = `
            SELECT
              '${table}' as table_name,
              ${selectColumns},
              MATCH(${columnList}) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance_score
            FROM ${table}
            WHERE MATCH(${columnList}) AGAINST(? IN NATURAL LANGUAGE MODE)
          `;

          searchQueries.push(searchQuery);
          searchParams.push(query, query);
        }
      }

      if (searchQueries.length === 0) {
        return [];
      }

      // Combine all search queries with UNION and order by relevance
      const combinedQuery = `
        ${searchQueries.join(' UNION ALL ')}
        ORDER BY relevance_score DESC
        LIMIT ? OFFSET ?
      `;

      searchParams.push(limit, offset);

      const [results] = await connection.execute<RowDataPacket[]>(combinedQuery, searchParams);

      return results;
    } finally {
      connection.release();
    }
  }

  /**
   * Get search suggestions based on existing data
   */
  public async getSearchSuggestions(
    connectionId: string,
    partialQuery: string,
    tables: string[],
    limit: number = 5
  ): Promise<string[]> {
    const connection = await this.getConnection(connectionId);

    try {
      const suggestions: Set<string> = new Set();

      for (const table of tables) {
        // Get full-text indexed columns
        const [indexes] = await connection.execute<RowDataPacket[]>(
          'SHOW INDEX FROM ?? WHERE Index_type = ?',
          [table, 'FULLTEXT']
        );

        const columns = [...new Set(indexes.map(idx => idx.Column_name))];

        for (const column of columns) {
          const [results] = await connection.execute<RowDataPacket[]>(
            `SELECT DISTINCT ?? FROM ?? WHERE ?? LIKE ? LIMIT ?`,
            [column, table, column, `%${partialQuery}%`, limit]
          );

          results.forEach(row => {
            const value = row[column];
            if (
              typeof value === 'string' &&
              value.toLowerCase().includes(partialQuery.toLowerCase())
            ) {
              suggestions.add(value);
            }
          });
        }
      }

      return Array.from(suggestions).slice(0, limit);
    } finally {
      connection.release();
    }
  }

  /**
   * Analyze query performance and suggest optimizations
   */
  public async analyzeQueryPerformance(connectionId: string, query: string): Promise<any[]> {
    const connection = await this.getConnection(connectionId);

    try {
      // Use EXPLAIN to analyze the query
      const [explanation] = await connection.execute<RowDataPacket[]>(`EXPLAIN ${query}`);

      return explanation;
    } finally {
      connection.release();
    }
  }

  /**
   * Close all connections
   */
  public async closeAllConnections(): Promise<void> {
    const promises = Array.from(this.connections.values()).map(pool => pool.end());
    await Promise.all(promises);
    this.connections.clear();
    logger.info('All database connections closed');
  }

  /**
   * Helper method to determine if a column type is searchable
   */
  private isColumnSearchable(columnType: string): boolean {
    const searchableTypes = ['varchar', 'text', 'char', 'longtext', 'mediumtext', 'tinytext'];
    return searchableTypes.some(type => columnType.toLowerCase().includes(type));
  }

  /**
   * Helper method to group indexes by name
   */
  private groupIndexesByName(indexes: RowDataPacket[]): FullTextIndex[] {
    const grouped = new Map<string, string[]>();

    indexes.forEach(index => {
      const indexName = index.Key_name;
      const columnName = index.Column_name;

      if (!grouped.has(indexName)) {
        grouped.set(indexName, []);
      }
      grouped.get(indexName)!.push(columnName);
    });

    return Array.from(grouped.entries()).map(([name, columns]) => ({
      name,
      columns,
      type: 'FULLTEXT' as const,
    }));
  }

  /**
   * Get connection status for all databases
   */
  public async getConnectionStatuses(): Promise<Record<string, boolean>> {
    const statuses: Record<string, boolean> = {};

    for (const [connectionId] of this.connections) {
      statuses[connectionId] = await this.testConnection(connectionId);
    }

    return statuses;
  }
}
