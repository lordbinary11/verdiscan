#!/bin/bash

echo "🌱 Starting Plant Disease Detection API..."
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it first."
    exit 1
fi

echo "✅ Docker environment ready"

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check health
echo "🏥 Checking API health..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ API is healthy and running!"
    echo ""
    echo "🌐 Access your API at:"
    echo "   - API: http://localhost:8000"
    echo "   - Docs: http://localhost:8000/docs"
    echo "   - Health: http://localhost:8000/health"
    echo ""
    echo "📱 Test with:"
    echo "   curl http://localhost:8000/health"
    echo ""
    echo "🛑 To stop services: docker-compose down"
else
    echo "❌ API health check failed"
    echo "📋 Check logs with: docker-compose logs plant-disease-api"
    exit 1
fi
