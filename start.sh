#!/bin/bash
# ============================================================
# SIMONE-WEBSHOP-01 - Startup Script
# Usage: ./start.sh [dev|prod|social]
# ============================================================

set -e

MODE=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting Simone's Webshop..."
echo "   Mode: $MODE"
echo ""

# Check if .env exists
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
    echo "📝 Please edit .env with your API keys before continuing!"
    exit 1
fi

# Load environment variables
export $(cat "$SCRIPT_DIR/.env" | grep -v '^#' | xargs)

case $MODE in
    dev)
        echo "🔧 Starting development environment..."
        docker-compose up -d postgres redis n8n
        echo "⏳ Waiting for services to be ready..."
        sleep 5
        echo "🌐 Starting Next.js in dev mode..."
        npm run dev
        ;;
    
    prod)
        echo "🏭 Starting production environment..."
        docker-compose up -d --build
        echo ""
        echo "✅ Production environment is running!"
        echo ""
        echo "📍 Access your services:"
        echo "   🛍️  Shop:     http://localhost:3000"
        echo "   ⚡ n8n:      http://localhost:5678"
        echo "   🗄️  Postgres: localhost:5432"
        echo "   📦 Redis:    localhost:6379"
        ;;
    
    social)
        echo "📱 Starting with social media automation..."
        docker-compose --profile social up -d --build
        echo ""
        echo "✅ Full environment with ClawdBot is running!"
        echo ""
        echo "📍 Access your services:"
        echo "   🛍️  Shop:      http://localhost:3000"
        echo "   ⚡ n8n:       http://localhost:5678"
        echo "   🤖 ClawdBot:  http://localhost:8080"
        ;;
    
    stop)
        echo "🛑 Stopping all services..."
        docker-compose --profile social down
        echo "✅ All services stopped."
        ;;
    
    logs)
        docker-compose logs -f
        ;;
    
    *)
        echo "Usage: ./start.sh [dev|prod|social|stop|logs]"
        echo ""
        echo "  dev    - Start services + Next.js dev server"
        echo "  prod   - Start full production stack"
        echo "  social - Start with ClawdBot for social media"
        echo "  stop   - Stop all services"
        echo "  logs   - View container logs"
        exit 1
        ;;
esac
