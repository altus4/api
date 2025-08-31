import { SearchService } from './SearchService';

describe('SearchService', () => {
  let searchService: SearchService;
  let mockDatabaseService: any;
  let mockCacheService: any;
  let mockAIService: any;

  beforeEach(async () => {
    // Create mock services
    mockDatabaseService = {
      executeFullTextSearch: jest.fn(),
      getSearchSuggestions: jest.fn(),
      analyzeQueryPerformance: jest.fn(() => [
        { metric: 'execution_time', value: 35 },
        { metric: 'result_count', value: 365 },
      ]),
      testConnection: jest.fn(),
      close: jest.fn(),
    };

    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      getPopularQueries: jest.fn(() => []),
      logSearchAnalytics: jest.fn(),
      close: jest.fn(),
    };

    mockAIService = {
      isAvailable: jest.fn(() => false),
      processSearchQuery: jest.fn(),
      categorizeResults: jest.fn(() => []),
      getQuerySuggestions: jest.fn(() => []),
    };

    // Initialize SearchService with mocks (databaseService, aiService, cacheService)
    searchService = new SearchService(mockDatabaseService, mockAIService, mockCacheService);
  });

  // No cleanup needed for mocked services

  describe('performSearch', () => {
    it('should return search results from database', async () => {
      // Arrange
      const query = 'test query';
      const rawResults = [
        { id: 1, title: 'Test Result 1', content: 'Test content 1', score: 0.9 },
        { id: 2, title: 'Test Result 2', content: 'Test content 2', score: 0.8 },
      ];

      mockDatabaseService.executeFullTextSearch.mockResolvedValue(rawResults);
      mockCacheService.get.mockResolvedValue(null);

      // Act
      const results = await searchService.performSearch(query, {
        databases: ['test-db-1'],
      });

      // Assert
      expect(results.success).toBe(true);
      expect(results.data).toBeDefined();
      expect(results.data.results).toHaveLength(rawResults.length);
      expect(results.data.results[0].data).toEqual(rawResults[0]);
      expect(results.data.results[1].data).toEqual(rawResults[1]);
      expect(results.data.totalCount).toBe(rawResults.length);

      expect(mockDatabaseService.executeFullTextSearch).toHaveBeenCalledWith(
        'test-db-1',
        query,
        [],
        undefined,
        20,
        0
      );
    });

    it('should return cached results when available', async () => {
      // Arrange
      const query = 'cached query';
      const cachedResponse = {
        results: [{ id: 3, title: 'Cached Result', score: 0.95 }],
        totalCount: 1,
        executionTime: 2,
        query: 'cached query',
        categories: [],
        suggestions: [],
      };

      mockCacheService.get.mockResolvedValue(cachedResponse);

      // Act
      const results = await searchService.performSearch(query);

      // Assert
      expect(results.success).toBe(true);
      expect(results.data).toEqual(cachedResponse);
      expect(mockDatabaseService.executeFullTextSearch).not.toHaveBeenCalled();
    });

    it('should handle empty search query', async () => {
      // Act
      const results = await searchService.performSearch('');

      // Assert - empty query should return empty results, not an error
      expect(results.success).toBe(true);
      expect(results.data.results).toEqual([]);
      expect(results.data.totalCount).toBe(0);
    });

    it('should handle cache errors gracefully', async () => {
      // Arrange
      const query = 'test query';
      // Make the cache service throw an error but search should still succeed
      mockCacheService.set.mockRejectedValue(new Error('Cache service failed'));
      mockDatabaseService.executeFullTextSearch.mockResolvedValue([
        { id: 1, title: 'Test Result', content: 'Test content', score: 0.8 },
      ]);

      // Act
      const results = await searchService.performSearch(query, {
        databases: ['test-db-1'],
      });

      // Assert - The search should succeed despite cache error
      expect(results.success).toBe(true);
      expect(results.data).toBeDefined();
      expect(results.data.results).toHaveLength(1);
      expect(results.data.results[0].data.title).toBe('Test Result');

      // Verify that database search was still called
      expect(mockDatabaseService.executeFullTextSearch).toHaveBeenCalledWith(
        'test-db-1',
        query,
        [],
        undefined,
        20,
        0
      );
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const query = 'test query';
      // Make the database service throw an error
      mockDatabaseService.executeFullTextSearch.mockRejectedValue(
        new Error('Database connection failed')
      );
      mockCacheService.get.mockResolvedValue(null); // No cached results

      // Act
      const results = await searchService.performSearch(query, {
        databases: ['test-db-1'],
      });

      // Assert - The search should fail due to database error
      expect(results.success).toBe(false);
      expect(results.error).toEqual(
        expect.objectContaining({
          code: 'SEARCH_FAILED',
          message: expect.stringContaining('All 1 databases failed to respond'),
        })
      );
    });
  });

  describe('getSearchSuggestions', () => {
    it('should return search suggestions', async () => {
      // Arrange
      const partialQuery = 'datab';
      const popularQueries = ['database', 'data backup', 'database optimization'];
      const expectedSuggestions = [
        { text: 'database', score: 0.8, type: 'popular' },
        { text: 'data backup', score: 0.8, type: 'popular' },
        { text: 'database optimization', score: 0.8, type: 'popular' },
      ];

      mockCacheService.getPopularQueries = jest.fn().mockResolvedValue(popularQueries);

      // Act
      const suggestions = await searchService.getSearchSuggestions({
        query: partialQuery,
        userId: 'test-user',
      });

      // Assert
      expect(suggestions).toEqual(expectedSuggestions);
      expect(mockCacheService.getPopularQueries).toHaveBeenCalledWith(partialQuery);
    });

    it('should handle empty partial query', async () => {
      // Arrange
      mockCacheService.getPopularQueries = jest.fn().mockResolvedValue([]);

      // Act
      const suggestions = await searchService.getSearchSuggestions({
        query: '',
        userId: 'test-user',
      });

      // Assert
      expect(suggestions).toEqual([]);
    });
  });

  describe('analyzeSearchPerformance', () => {
    it('should return performance metrics', async () => {
      // Act
      const metrics = await searchService.analyzeSearchPerformance();

      // Assert - Just verify the structure since values are randomly generated
      expect(metrics).toHaveLength(2);
      expect(metrics[0]).toHaveProperty('metric', 'execution_time');
      expect(metrics[0]).toHaveProperty('value');
      expect(metrics[1]).toHaveProperty('metric', 'result_count');
      expect(metrics[1]).toHaveProperty('value');
    });
  });
});
