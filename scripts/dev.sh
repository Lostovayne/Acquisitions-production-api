#!/bin/bash

# Development startup script for Acquisition App with Neon Local
# This script starts the application in development mode with Neon Local

echo "🚀 Starting Acquisition App in Development Mode"
echo "================================================"

# Check if .env.development exists
if [ ! -f .env.development ]; then
    echo "❌ Error: .env.development file not found!"
    echo "   Please make sure .env.development exists with your Neon credentials."
    exit 1
fi

# Load environment variables for local commands
export $(cat .env.development | grep -v '^#' | xargs)

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

# Create .neon_local directory if it doesn't exist
mkdir -p .neon_local

# Add .neon_local to .gitignore if not already present
if ! grep -q ".neon_local/" .gitignore 2>/dev/null; then
    echo ".neon_local/" >> .gitignore
    echo "✅ Added .neon_local/ to .gitignore"
fi

echo "📦 Building and starting development containers..."
echo "   - Neon Local proxy will create an ephemeral database branch"
echo "   - Application will run with hot reload enabled"
echo ""

# Start development environment first
docker compose -f docker-compose.dev.yml --env-file .env.development up -d --build

echo "⏳ Waiting for Neon Local to be ready..."
sleep 10

# Run migrations inside the container after PostgreSQL is ready
echo "📜 Applying latest schema with Drizzle..."
docker compose -f docker-compose.dev.yml exec app npm run db:migrate

# Show logs in foreground
echo "📊 Showing application logs (Ctrl+C to stop)..."
docker compose -f docker-compose.dev.yml logs -f

echo ""
echo "🎉 Development environment started!"
echo "   Application: http://localhost:3000"
echo "   Health Check: http://localhost:3000/health"
echo "   Database: postgres://neon:npg@localhost:5432/neondb"
echo ""
echo "To stop the environment, run: docker compose -f docker-compose.dev.yml down"