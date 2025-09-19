#!/bin/bash

# Production Quick Start Script
echo "🚀 Starting Acquisitions API in Production Mode"
echo "📋 This will start the API with direct Neon Cloud connection"
echo ""

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ Missing .env.production file"
    echo "📝 Please copy .env.production.template to .env.production and configure:"
    echo "   - DATABASE_URL (your Neon Cloud connection string)"
    echo "   - JWT_SECRET (strong production secret)"
    echo "   - CORS_ORIGIN (your frontend domain)"
    echo ""
    echo "💡 Get DATABASE_URL from: https://console.neon.com"
    exit 1
fi

echo "🔧 Configuration found, starting production container..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up --build

echo ""
echo "🎉 Production environment started!"
echo "🌐 API: http://localhost:3000"
echo "🏥 Health: http://localhost:3000/health"