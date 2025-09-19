#!/bin/bash

# Restart only the app container without rebuilding
echo "🔄 Restarting application container..."
echo "📦 This will restart the app without rebuilding the image"
echo ""

# Check if containers are running
if ! docker compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo "❌ Development environment is not running"
    echo "   Start it first with: npm run docker:dev"
    exit 1
fi

# Restart only the app container
echo "🔄 Restarting app container..."
docker compose -f docker-compose.dev.yml restart app

echo ""
echo "✅ App container restarted!"
echo "   Your changes should be reflected now"
echo "   Check logs: docker compose -f docker-compose.dev.yml logs -f app"