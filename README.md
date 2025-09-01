# Altus 4

**AI-Enhanced MySQL Full-Text Search Engine**

Altus 4 is an intelligent search-as-a-service platform that leverages MySQL's built-in full-text search capabilities while adding AI-powered optimizations and enhancements. Instead of requiring users to migrate to specialized search solutions like Elasticsearch or Solr, Altus 4 enhances MySQL's native `FULLTEXT` search with semantic understanding, query optimization, and comprehensive analytics.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Documentation](#documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Quick Start

Get Altus 4 running in 5 minutes:

```bash
# Clone and install
git clone https://github.com/yourusername/altus4.git
cd altus4 && npm install

# Setup environment
cp .env.example .env
# Edit .env with your MySQL/Redis credentials

# Run database migrations
npm run migrate

# Start development server
npm run dev
# Server starts at http://localhost:3000
```

## Database Migrations

Altus 4 includes a migration system for managing your MySQL schema changes.

- Migration SQL files are stored in the `migrations/` directory
- Each migration consists of an `up` script (e.g., `001_create_users_table.up.sql`) and a corresponding `down` script (e.g., `001_create_users_table.down.sql`)
- The migration tool automatically uses your environment variables for database connectivity

### Usage

Run migrations using npm scripts:

```bash
# Apply all migrations (up)
npm run migrate

# Apply all migrations (explicit up)
npm run migrate:up

# Revert all migrations (down)
npm run migrate:down

# Show migration status
npm run migrate:status
```

### Environment Configuration

The migration system uses the same environment variables as the application:

```bash
# Required environment variables
DB_HOST=localhost        # Database host
DB_PORT=3306            # Database port (optional, defaults to 3306)
DB_USERNAME=altus4_user # Database username
DB_PASSWORD=password    # Database password
DB_DATABASE=altus4_meta # Database name
```

You can set these in your `.env` file or as environment variables. The migration script will automatically load your `.env` file if it exists.

### Manual Script Usage

You can also run the migration script directly:

```bash
# Apply all migrations
./bin/migrate.sh up

# Revert all migrations
./bin/migrate.sh down

# Show detailed migration status
./bin/migrate.sh status
```

**Note:** Ensure your database exists before running migrations. The migration system will not create the database automatically.

**For comprehensive documentation, see the [`/docs`](./docs) directory.**

## Overview

### The Problem

Many applications using MySQL struggle with search functionality, often requiring complex migrations to specialized search engines like Elasticsearch. This creates additional infrastructure complexity, data synchronization challenges, and operational overhead.

### The Solution

Altus 4 bridges this gap by enhancing MySQL's existing full-text search capabilities with:

- **AI-powered semantic search** for better result relevance
- **Natural language query processing** for user-friendly search interfaces
- **Intelligent query optimization** and performance suggestions
- **Multi-database federation** for searching across multiple data sources
- **Real-time analytics** and search trend insights
- **Zero-migration setup** that works with existing MySQL databases

## Features

### Core Search Capabilities

- **Full-Text Search Enhancement**: Leverages MySQL's `FULLTEXT` indexes with intelligent query optimization
- **Multi-Search Modes**: Natural language, boolean, and semantic search options
- **Cross-Database Search**: Federate searches across multiple connected MySQL databases
- **Intelligent Ranking**: Advanced relevance scoring and result ranking algorithms
- **Auto-Suggestions**: Real-time query suggestions and auto-completion

### AI-Powered Enhancements

- **Semantic Search**: Uses OpenAI embeddings for concept-based matching beyond keyword search
- **Query Optimization**: AI-powered analysis of search patterns with performance recommendations
- **Result Categorization**: Automatic classification and tagging of search results
- **Natural Language Processing**: Convert plain English queries to optimized SQL
- **Trend Analysis**: Identify search patterns and popular queries over time

### Enterprise Features

- **Multi-Tenant Architecture**: Secure isolation between different user accounts and databases
- **Role-Based Access Control**: Fine-grained permissions and user management
- **Rate Limiting**: Configurable API throttling and abuse prevention
- **Comprehensive Logging**: Structured logging with request tracing and analytics
- **Health Monitoring**: Built-in health checks and performance metrics

### Security & Performance

- **Encrypted Credentials**: Database connection credentials are encrypted at rest
- **JWT Authentication**: Secure token-based authentication with configurable expiration
- **SQL Injection Prevention**: Parameterized queries and input sanitization
- **Connection Pooling**: Optimized database connection management
- **Redis Caching**: Intelligent caching for improved response times
- **Input Validation**: Comprehensive request validation using Zod schemas

## Architecture

### System Architecture

Altus 4 follows a layered architecture pattern with four primary components:

1. **API Layer**: RESTful endpoints with authentication, validation, and rate limiting
2. **Service Layer**: Business logic orchestration and data processing
3. **Data Layer**: MySQL connection management and Redis caching
4. **Integration Layer**: External AI services and third-party integrations

### Core Services

- **DatabaseService**: Manages MySQL connections, schema discovery, and query execution
- **SearchService**: Orchestrates search operations and result processing
- **AIService**: Handles OpenAI integration for semantic enhancements
- **CacheService**: Redis-based caching and analytics storage
- **AuthService**: User authentication and authorization management

### Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript with strict type checking
- **Framework**: Express.js with comprehensive middleware
- **Database**: MySQL 8.0+ for both client data and metadata storage
- **Cache**: Redis 6.0+ for performance optimization
- **AI Integration**: OpenAI API (GPT-3.5/GPT-4) for semantic capabilities
- **Validation**: Zod for runtime type checking and validation
- **Authentication**: JWT with bcrypt for password hashing
- **Logging**: Winston with structured logging
- **Testing**: Jest with comprehensive test coverage

## Prerequisites

Before installing Altus 4, ensure you have the following dependencies:

### Required Software

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (or yarn/pnpm equivalent)
- **MySQL**: Version 8.0 or higher
- **Redis**: Version 6.0 or higher

### Optional Dependencies

- **OpenAI API Access**: Required for AI-enhanced features
- **Docker**: For containerized deployment (recommended for production)

### System Requirements

- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: At least 1GB free disk space
- **Network**: Internet connectivity for AI services and package downloads

## Installation

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/altus4.git
cd altus4

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Configure your environment variables (see Configuration section)
nano .env

# Run database migrations
npm run migrate

# Build the project
npm run build

# Start development server
npm run dev
```

### Database Setup

Create the required MySQL database and user:

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE altus4_metadata CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'altus4_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON altus4_metadata.* TO 'altus4_user'@'localhost';
FLUSH PRIVILEGES;
```

### Redis Setup

Ensure Redis is running and accessible:

```bash
# Start Redis (varies by system)
redis-server

# Test connection
redis-cli ping
# Should return: PONG
```

### Environment Configuration

Generate secure secrets for your environment:

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Configuration

### Environment Variables

Altus 4 uses environment variables for configuration. Copy `.env.example` to `.env` and configure:

#### Server Configuration

```bash
NODE_ENV=development          # Environment: development, production, test
PORT=3000                    # Server port
```

#### Database Configuration

```bash
DB_HOST=localhost            # MySQL host
DB_PORT=3306                # MySQL port
DB_USERNAME=altus4_user     # MySQL username
DB_PASSWORD=secure_password  # MySQL password
DB_DATABASE=altus4_metadata # MySQL database name
```

#### Security Configuration

```bash
JWT_SECRET=your_32_char_secret    # JWT signing secret (32+ characters)
ENCRYPTION_KEY=your_32_char_key   # Encryption key for credentials
JWT_EXPIRES_IN=7d                 # JWT token expiration
```

#### Redis Configuration

```bash
REDIS_HOST=localhost         # Redis host
REDIS_PORT=6379             # Redis port
REDIS_PASSWORD=             # Redis password (if required)
```

#### AI Integration Configuration

```bash
OPENAI_API_KEY=sk-your_key  # OpenAI API key
OPENAI_MODEL=gpt-3.5-turbo  # OpenAI model to use
OPENAI_MAX_TOKENS=1000      # Maximum tokens per request
```

#### Rate Limiting Configuration

```bash
RATE_LIMIT_WINDOW_MS=900000      # Rate limit window (15 minutes)
RATE_LIMIT_MAX_REQUESTS=100      # Maximum requests per window
```

### Configuration Validation

Altus 4 validates all configuration on startup and will fail fast if required variables are missing or invalid.

## Usage

### Starting the Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run start

# Build for production
npm run build
```

### Health Check

Verify the server is running:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "0.1.0",
  "uptime": 1234.567
}
```

### Basic API Usage

#### Authentication

Register a new user:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure_password",
    "name": "Test User"
  }'
```

Login to get JWT token:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure_password"
  }'
```

#### Database Management

Add a database connection:

```bash
curl -X POST http://localhost:3000/api/v1/databases \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Database",
    "host": "localhost",
    "port": 3306,
    "database": "my_app_db",
    "username": "db_user",
    "password": "db_password"
  }'
```

#### Search Operations

Execute a search:

```bash
curl -X POST http://localhost:3000/api/v1/search \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "search terms",
    "databases": ["database_id"],
    "searchMode": "natural",
    "limit": 20,
    "includeAnalytics": false
  }'
```

## API Reference

### Authentication Endpoints

| Method | Endpoint                | Description       | Authentication |
| ------ | ----------------------- | ----------------- | -------------- |
| POST   | `/api/v1/auth/register` | Register new user | None           |
| POST   | `/api/v1/auth/login`    | User login        | None           |
| POST   | `/api/v1/auth/logout`   | User logout       | Bearer Token   |
| GET    | `/api/v1/auth/profile`  | Get user profile  | Bearer Token   |

### Database Management Endpoints

| Method | Endpoint                       | Description                | Authentication |
| ------ | ------------------------------ | -------------------------- | -------------- |
| GET    | `/api/v1/databases`            | List user databases        | Bearer Token   |
| POST   | `/api/v1/databases`            | Add database connection    | Bearer Token   |
| GET    | `/api/v1/databases/:id`        | Get database details       | Bearer Token   |
| PUT    | `/api/v1/databases/:id`        | Update database connection | Bearer Token   |
| DELETE | `/api/v1/databases/:id`        | Remove database connection | Bearer Token   |
| GET    | `/api/v1/databases/:id/schema` | Get database schema        | Bearer Token   |

### Search Endpoints

| Method | Endpoint                     | Description               | Authentication |
| ------ | ---------------------------- | ------------------------- | -------------- |
| POST   | `/api/v1/search`             | Execute search            | Bearer Token   |
| GET    | `/api/v1/search/suggestions` | Get search suggestions    | Bearer Token   |
| POST   | `/api/v1/search/analyze`     | Analyze query performance | Bearer Token   |
| GET    | `/api/v1/search/trends`      | Get search trends         | Bearer Token   |
| GET    | `/api/v1/search/history`     | Get search history        | Bearer Token   |

### Request/Response Formats

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: Date;
    requestId: string;
    version: string;
  };
}
```

### Error Codes

| Code                  | HTTP Status | Description                       |
| --------------------- | ----------- | --------------------------------- |
| `UNAUTHORIZED`        | 401         | Missing or invalid authentication |
| `FORBIDDEN`           | 403         | Insufficient permissions          |
| `NOT_FOUND`           | 404         | Resource not found                |
| `VALIDATION_ERROR`    | 400         | Invalid request data              |
| `RATE_LIMIT_EXCEEDED` | 429         | Too many requests                 |
| `INTERNAL_ERROR`      | 500         | Server error                      |

## Documentation

This README provides a quick overview. For comprehensive documentation:

### **Complete Documentation**

- **[Full Documentation](./docs/README.md)** - Complete documentation index
- **[API Reference](./docs/api/README.md)** - Detailed API endpoints and schemas
- **[Architecture](./docs/architecture/README.md)** - System design and patterns
- **[Services](./docs/services/README.md)** - Service classes with code explanations
- **[Setup & Deployment](./docs/setup/README.md)** - Installation and deployment guides
- **[Testing](./docs/testing/README.md)** - Testing strategies and examples
- **[Development](./docs/development/README.md)** - Developer guides and best practices
- **[Examples](./docs/examples/README.md)** - Code examples and tutorials

### **Quick Links**

- [Service Documentation](./docs/services/) - Understand each service class
- [API Schemas](./docs/api/schemas/) - Request/response formats
- [Code Examples](./docs/examples/) - Working code samples
- [Testing Guide](./docs/testing/unit-tests.md) - How to write and run tests

## Development

### Project Structure

```text
src/
├── config/          # Configuration management
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── routes/         # API route definitions
├── services/       # Business logic services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── index.ts        # Application entry point
```

### Development Workflow

1. **Setup development environment**:

   ```bash
   npm run dev
   ```

2. **Make changes** to source code

3. **Run tests**:

   ```bash
   npm run test
   npm run test:watch
   ```

4. **Check code quality**:

   ```bash
   npm run lint
   npm run lint:fix
   ```

5. **Build project**:

   ```bash
   npm run build
   ```

### Code Style Guidelines

- **TypeScript**: Strict mode enabled with comprehensive type definitions
- **Naming Conventions**:
  - Variables and functions: `camelCase`
  - Classes and interfaces: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
- **File Organization**: Co-locate related files and group by feature
- **Error Handling**: Use custom `AppError` class with proper error codes
- **Async Patterns**: Prefer `async/await` over Promise chains
- **Logging**: Use structured logging with appropriate levels

### Adding New Features

When adding new functionality:

1. **Update TypeScript types** in `src/types/index.ts`
2. **Create service classes** with dependency injection
3. **Add route handlers** with proper validation
4. **Include comprehensive tests**
5. **Update API documentation**
6. **Add configuration options** if needed

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- --testPathPattern=SearchService
```

### Test Structure

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test API endpoints and service interactions
- **Database Tests**: Test database operations with test database
- **Mock Tests**: Mock external dependencies (OpenAI, Redis)

### Writing Tests

Tests should follow this structure:

```typescript
describe('ServiceName', () => {
  beforeEach(() => {
    // Setup test environment
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('methodName', () => {
    it('should handle success case', async () => {
      // Test implementation
    });

    it('should handle error case', async () => {
      // Test error scenarios
    });
  });
});
```

### Test Coverage

Maintain minimum 80% test coverage across:

- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

## Deployment

### Production Environment

#### Environment Variables

Set these environment variables for production:

```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=warn
JWT_EXPIRES_IN=24h
ENABLE_QUERY_LOGGING=false
```

#### Database Optimization

For production MySQL databases:

```sql
-- Optimize for full-text search
SET GLOBAL ft_min_word_len = 2;
SET GLOBAL innodb_ft_min_token_size = 2;

-- Restart MySQL to apply changes
```

#### Redis Configuration

Configure Redis for production:

```bash
# Enable persistence
appendonly yes
appendfsync everysec

# Set memory policies
maxmemory-policy allkeys-lru
```

### Docker Deployment

#### Docker Compose

```yaml
version: '3.8'

services:
  altus4:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: altus4_metadata
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
```

#### Building Docker Image

```bash
# Build image
docker build -t altus4:latest .

# Run container
docker run -d -p 3000:3000 altus4:latest
```

### Health Checks

Configure health checks for production monitoring:

```bash
# HTTP health check endpoint
curl http://localhost:3000/health

# Database connectivity check
curl http://localhost:3000/health/db

# Redis connectivity check
curl http://localhost:3000/health/redis
```

### Monitoring

Monitor these key metrics in production:

- **Response times**: API endpoint performance
- **Error rates**: Application and system errors
- **Resource usage**: CPU, memory, disk utilization
- **Database performance**: Query execution times, connection pool usage
- **Cache performance**: Redis hit/miss ratios
- **Search analytics**: Query volumes, popular searches

## Contributing

We welcome contributions to Altus 4! Please follow these guidelines:

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** from `main`
4. **Install dependencies**: `npm install`
5. **Set up development environment** following the Installation guide

### Contribution Workflow

1. **Create an issue** describing the feature or bug
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** following the code style guidelines
4. **Add tests** for new functionality
5. **Run the test suite**: `npm run test`
6. **Run linting**: `npm run lint:fix`
7. **Commit your changes**: `git commit -m "Add feature: description"`
8. **Push to your fork**: `git push origin feature/your-feature-name`
9. **Create a Pull Request** with a detailed description

### Pull Request Guidelines

- **Title**: Clear, descriptive title
- **Description**: Detailed explanation of changes
- **Tests**: Include tests for new functionality
- **Documentation**: Update relevant documentation
- **Breaking Changes**: Clearly note any breaking changes

### Code Review Process

All contributions go through code review:

1. **Automated checks**: CI runs tests and linting
2. **Manual review**: Core team reviews code quality and design
3. **Feedback**: Address any review comments
4. **Approval**: Two approvals required for merge

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

### MIT License Summary

- **Commercial use**: Permitted
- **Modification**: Permitted
- **Distribution**: Permitted
- **Private use**: Permitted
- **Liability**: Limited
- **Warranty**: No warranty provided

## Support

### Getting Help

- **Documentation**: Check this README and inline code documentation
- **Issues**: Report bugs and request features on [GitHub Issues](https://github.com/yourusername/altus4/issues)
- **Discussions**: Ask questions on [GitHub Discussions](https://github.com/yourusername/altus4/discussions)

### Commercial Support

For enterprise support, custom development, or consulting services, please contact:

- **Email**: <support@altus4.dev>
- **Website**: <https://altus4.dev>

### Community

- **GitHub**: <https://github.com/yourusername/altus4>
- **Documentation**: <https://docs.altus4.dev>
- **Changelog**: <https://github.com/yourusername/altus4/releases>

---

**Altus 4** - Making MySQL search intelligent, one query at a time.
