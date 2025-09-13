# Altus4 Scripts Directory

This directory contains all operational scripts for the Altus4 project, organized by functionality.

## Directory Structure

```
bin/
├── dev/                       # Development Environment
│   ├── start.sh              # Start Docker services & run migrations
│   ├── stop.sh               # Stop Docker services
│   ├── reset.sh              # Reset development environment
│   └── docker-compose.yml    # Docker services configuration
├── db/                        # Database Operations
│   └── migrate.sh            # Database migration management
├── security/                  # Security & Authentication
│   ├── generate-jwt-secret.sh # Generate JWT secrets
│   ├── setup-gpg.sh          # GPG configuration
│   └── verify-commits.sh     # Commit signature verification
├── test/                      # Testing Utilities
│   └── test-hooks.sh         # Git hooks testing
├── dev-start*                # Convenience: Start development
├── dev-stop*                 # Convenience: Stop development
├── dev-reset*                # Convenience: Reset development
└── migrate*                  # Convenience: Database migrations
```

## Quick Start Commands

### Development Environment

```bash
# Start development environment (MySQL + Redis + migrations)
./bin/dev-start

# Stop development environment
./bin/dev-stop

# Reset development environment (clean slate)
./bin/dev-reset
```

### Database Management

```bash
# Run all pending migrations
./bin/migrate up

# Check migration status
./bin/migrate status

# Rollback last migration
./bin/migrate down
```

### Security Operations

```bash
# Generate a new JWT secret
./bin/security/generate-jwt-secret.sh

# Set up GPG for commit signing
./bin/security/setup-gpg.sh

# Verify commit signatures
./bin/security/verify-commits.sh
```

### Testing

```bash
# Test Git hooks
./bin/test/test-hooks.sh
```

## Script Details

### Development Scripts (`dev/`)

- **`start.sh`**: Complete development environment startup
  - Starts Docker services (MySQL, Redis)
  - Waits for services to be healthy
  - Runs database migrations
  - Provides connection details

- **`stop.sh`**: Gracefully stops all Docker services

- **`reset.sh`**: Complete environment reset
  - Stops services
  - Removes containers and volumes
  - Cleans up networks

### Database Scripts (`db/`)

- **`migrate.sh`**: Database migration management
  - Supports `up`, `down`, and `status` commands
  - Reads from `migrations/` directory
  - Uses environment variables for connection

### Security Scripts (`security/`)

- **`generate-jwt-secret.sh`**: Generates cryptographically secure JWT secrets
- **`setup-gpg.sh`**: Configures GPG for commit signing
- **`verify-commits.sh`**: Validates commit signatures

### Test Scripts (`test/`)

- **`test-hooks.sh`**: Tests Git hooks functionality

## Environment Variables

Most scripts respect these environment variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=altus4

# Development Environment
NODE_ENV=development
PORT=3000
```

## Usage Examples

```bash
# Complete development setup
./bin/dev-start

# Run a specific migration
./bin/db/migrate.sh up

# Generate new JWT secret for production
./bin/security/generate-jwt-secret.sh

# Stop everything when done
./bin/dev-stop
```

## Migration from Old Structure

The scripts were reorganized from:

- `bin/` (mixed scripts) → `bin/{category}/` (organized)
- `script/local/` (Docker scripts) → `bin/dev/` (consolidated)

Convenience scripts at `bin/` root provide backward compatibility and easy access.
