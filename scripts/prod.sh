#!/bin/bash

# Production deployment script for Acquisition App
# This script starts the application in production mode with Neon Cloud Database

echo "🚀 Starting Acquisition App in Production Mode"
echo "==============================================="

# Run production validation first
echo "🔍 Running production validation..."
if ! ./scripts/validate-prod.sh; then
    echo "❌ Production validation failed. Please fix the issues above."
    exit 1
fi

echo ""
echo "✅ Validation passed! Starting production deployment..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker and try again."
    exit 1
fi

# Load environment variables for local commands
export $(cat .env.production | grep -v '^#' | xargs)

echo "📦 Building and starting production container..."
echo "   - Using Neon Cloud Database (direct connection)"
echo "   - Running in optimized production mode"
echo "   - Security hardening enabled"
echo ""

# Stop any existing production containers
echo "🧹 Cleaning up existing containers..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Start production environment
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d

# Wait for application to be ready
echo "⏳ Waiting for application to be ready..."
sleep 20

# Check if container is running
if ! docker compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "❌ Container failed to start. Checking logs..."
    docker compose -f docker-compose.prod.yml logs
    exit 1
fi

# Run migrations inside the container
echo "📜 Applying latest schema with Drizzle..."
if ! docker compose -f docker-compose.prod.yml exec -T app npm run db:migrate; then
    echo "⚠️  Migration failed, but container is running. You may need to run migrations manually."
fi

# Show container status
echo ""
echo "📊 Production Status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🎉 Production environment started!"
echo "   Application: http://localhost:3000"
echo "   Health Check: http://localhost:3000/health"
echo "   Container: acquisitions-api-prod"
echo ""
echo "Useful commands:"
echo "   View logs: docker logs -f acquisitions-api-prod"
echo "   View compose logs: docker compose -f docker-compose.prod.yml logs -f"
echo "   Stop app: docker compose -f docker-compose.prod.yml down"
echo "   Check status: docker compose -f docker-compose.prod.yml ps"
echo "   Run migrations: docker compose -f docker-compose.prod.yml exec app npm run db:migrate"