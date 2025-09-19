#!/bin/bash

# Development Quick Start Script
echo "🚀 Starting Acquisitions API in Development Mode"
echo "📋 This will start:"
echo "   - Neon Local proxy (creates ephemeral database branch)"
echo "   - API Application with hot reload"
echo ""

# Check if .env.dev.local exists
if [ ! -f ".env.dev.local" ]; then
    echo "❌ Missing .env.dev.local file"
    echo "📝 Please copy .env.development to .env.dev.local and configure:"
    echo "   - NEON_API_KEY"
    echo "   - NEON_PROJECT_ID" 
    echo "   - PARENT_BRANCH_ID"
    echo ""
    echo "💡 Get these values from: https://console.neon.com"
    exit 1
fi

echo "🔧 Configuration found, starting containers..."
docker-compose -f docker-compose.dev.yml --env-file .env.dev.local up --build

echo ""
echo "🎉 Development environment started!"
echo "🌐 API: http://localhost:3000"
echo "🏥 Health: http://localhost:3000/health"
echo "🗄️  Database: postgres://neon:npg@localhost:5432/main"