#!/bin/bash

# Validation script to check production readiness
echo "🔍 Validating Production Configuration"
echo "====================================="

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Missing .env.production file"
    echo "   Create it from .env.production.template"
    exit 1
fi

# Load variables
export $(cat .env.production | grep -v '^#' | xargs)

# Check required environment variables
missing_vars=()

if [ -z "$DATABASE_URL" ]; then
    missing_vars+=("DATABASE_URL")
fi

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-super-secret-jwt-key-here-make-it-long-and-random-for-production-use" ]; then
    missing_vars+=("JWT_SECRET (should be a strong production secret)")
fi

if [ -z "$NODE_ENV" ] || [ "$NODE_ENV" != "production" ]; then
    missing_vars+=("NODE_ENV (should be 'production')")
fi

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "❌ Missing or invalid required variables:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    exit 1
fi

# Check Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running"
    exit 1
fi

# Validate DATABASE_URL format
if [[ ! "$DATABASE_URL" =~ ^postgres ]]; then
    echo "❌ DATABASE_URL doesn't appear to be a valid PostgreSQL connection string"
    exit 1
fi

# Check if using Neon production URL
if [[ ! "$DATABASE_URL" =~ \.neon\.tech ]]; then
    echo "⚠️  Warning: DATABASE_URL doesn't appear to be a Neon Cloud URL"
    echo "   Make sure you're using your production Neon database"
fi

echo "✅ All production validations passed!"
echo ""
echo "Configuration Summary:"
echo "  NODE_ENV: $NODE_ENV"
echo "  PORT: $PORT"
echo "  DATABASE: ${DATABASE_URL:0:50}..."
echo "  JWT_SECRET: ${JWT_SECRET:0:10}... (${#JWT_SECRET} characters)"
echo "  CORS_ORIGIN: $CORS_ORIGIN"
echo ""
echo "🚀 Ready for production deployment!"