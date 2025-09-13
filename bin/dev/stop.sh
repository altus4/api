#!/bin/bash

# Altus4 Development Environment Stop Script
# This script stops the development environment

set -e

echo "Stopping Altus4 Development Environment..."

# Navigate to script directory
cd "$(dirname "$0")"

# Stop services
echo "Stopping Docker services..."
docker-compose down

echo "Success: All services stopped!"
echo ""
echo "Info: To start services again, run: ./script/local/start.sh"
