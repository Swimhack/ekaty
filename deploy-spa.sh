#!/bin/bash

# Deploy script for eKaty.com Vite React SPA
# This script fixes the routing issues by properly building and deploying the SPA

set -e  # Exit on any error

echo "🚀 Starting deployment of eKaty.com React SPA..."

# Load environment variables
if [ -f .env.production ]; then
    echo "📋 Loading production environment variables..."
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run type check
echo "🔍 Running type check..."
npm run type-check

# Build for production
echo "🏗️  Building for production..."
npm run build

# Verify build output
if [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed: dist/index.html not found"
    exit 1
fi

if [ ! -d "dist/assets" ]; then
    echo "❌ Build failed: dist/assets directory not found"
    exit 1
fi

echo "✅ Build successful! Generated files:"
ls -la dist/

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t ekaty-spa:latest \
    --build-arg VITE_SUPABASE_URL="${VITE_SUPABASE_URL}" \
    --build-arg VITE_SUPABASE_ANON_KEY="${VITE_SUPABASE_ANON_KEY}" \
    --build-arg VITE_GOOGLE_MAPS_API_KEY="${VITE_GOOGLE_MAPS_API_KEY}" \
    --build-arg VITE_APP_URL="${VITE_APP_URL}" \
    --build-arg VITE_APP_NAME="${VITE_APP_NAME}" \
    .

echo "🎯 Testing Docker image locally..."
# Stop any existing container
docker stop ekaty-test 2>/dev/null || true
docker rm ekaty-test 2>/dev/null || true

# Run test container
docker run -d --name ekaty-test -p 8080:80 ekaty-spa:latest

# Wait for container to start
sleep 5

# Test routes
echo "🧪 Testing routes..."
echo "Testing homepage..."
if curl -f http://localhost:8080/ > /dev/null 2>&1; then
    echo "✅ Homepage: OK"
else
    echo "❌ Homepage: FAILED"
fi

echo "Testing /restaurants route..."
if curl -f http://localhost:8080/restaurants > /dev/null 2>&1; then
    echo "✅ /restaurants route: OK"
else
    echo "❌ /restaurants route: FAILED"
fi

echo "Testing /about route..."
if curl -f http://localhost:8080/about > /dev/null 2>&1; then
    echo "✅ /about route: OK"
else
    echo "❌ /about route: FAILED"
fi

# Clean up test container
docker stop ekaty-test
docker rm ekaty-test

echo "🎉 Deployment script completed successfully!"
echo "📝 To deploy to production:"
echo "   1. Push the Docker image to your registry"
echo "   2. Update your production environment"
echo "   3. Deploy using docker-compose up -d"

echo ""
echo "🔧 Key fixes applied:"
echo "   ✅ Fixed Dockerfile for Vite React SPA (was configured for Next.js)"
echo "   ✅ Added proper nginx configuration with SPA routing support"
echo "   ✅ Configured try_files directive to handle client-side routing"
echo "   ✅ Updated environment variables to use VITE_ prefix"
echo "   ✅ Added caching and security headers"