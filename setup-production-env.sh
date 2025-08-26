#!/bin/bash

# Production Environment Setup Script for eKaty.com
# This script ensures all environment variables are correctly configured for production deployment

set -e

echo "🔧 Setting up production environment variables for eKaty.com..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Success message
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Warning message
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Error message
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Info message
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    error ".env.production file not found!"
    exit 1
fi

# Source environment variables
set -a
source .env.production
set +a

info "Validating required environment variables..."

# Required environment variables for production
required_vars=(
    "VITE_SUPABASE_URL"
    "VITE_SUPABASE_ANON_KEY"
    "VITE_APP_URL"
    "VITE_APP_NAME"
    "VITE_GOOGLE_PLACES_API_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "GOOGLE_PLACES_API_KEY"
)

# Validate each required variable
missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    else
        success "$var is set"
    fi
done

# Check if any variables are missing
if [ ${#missing_vars[@]} -gt 0 ]; then
    error "Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo -e "  ${RED}- $var${NC}"
    done
    exit 1
fi

# Validate Supabase URL format
if [[ ! $VITE_SUPABASE_URL =~ ^https://[a-z0-9]+\.supabase\.co$ ]]; then
    error "Invalid Supabase URL format: $VITE_SUPABASE_URL"
    exit 1
fi
success "Supabase URL format is valid"

# Validate JWT tokens format
if [[ ! $VITE_SUPABASE_ANON_KEY =~ ^eyJ ]]; then
    error "Invalid Supabase anon key format (should start with 'eyJ')"
    exit 1
fi
success "Supabase anon key format is valid"

if [[ ! $SUPABASE_SERVICE_ROLE_KEY =~ ^eyJ ]]; then
    error "Invalid Supabase service role key format (should start with 'eyJ')"
    exit 1
fi
success "Supabase service role key format is valid"

# Validate Google API Key format
if [[ ! $VITE_GOOGLE_PLACES_API_KEY =~ ^AIzaSy ]]; then
    error "Invalid Google Places API key format (should start with 'AIzaSy')"
    exit 1
fi
success "Google Places API key format is valid"

# Validate App URL
if [[ ! $VITE_APP_URL =~ ^https:// ]]; then
    error "App URL must use HTTPS in production: $VITE_APP_URL"
    exit 1
fi
success "App URL is using HTTPS"

# Create Docker environment file for deployment
info "Creating Docker environment file..."
cat > .env.docker << EOF
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_PLACES_API_KEY}
VITE_GOOGLE_PLACES_API_KEY=${VITE_GOOGLE_PLACES_API_KEY}
VITE_APP_URL=${VITE_APP_URL}
VITE_APP_NAME=${VITE_APP_NAME}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
GOOGLE_PLACES_API_KEY=${GOOGLE_PLACES_API_KEY}
NODE_ENV=production
EOF
success "Docker environment file created (.env.docker)"

# Test Supabase connection (if curl is available)
if command -v curl >/dev/null 2>&1; then
    info "Testing Supabase connection..."
    if curl -s -f -H "apikey: $VITE_SUPABASE_ANON_KEY" "$VITE_SUPABASE_URL/rest/v1/" >/dev/null; then
        success "Supabase connection test passed"
    else
        warning "Supabase connection test failed - please verify credentials"
    fi
else
    warning "curl not available - skipping Supabase connection test"
fi

echo ""
success "🎉 Production environment setup completed successfully!"
echo ""
echo -e "${BLUE}Environment Summary:${NC}"
echo -e "  App URL: $VITE_APP_URL"
echo -e "  Supabase URL: $VITE_SUPABASE_URL"
echo -e "  Environment: production"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Run: ${GREEN}npm run build${NC} to build the application"
echo -e "  2. Run: ${GREEN}docker-compose --env-file .env.docker up -d${NC} to deploy"
echo -e "  3. Check deployment: ${GREEN}docker-compose ps${NC}"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo -e "  - Never commit .env.docker to version control"
echo -e "  - Ensure firewall allows traffic on port 80"
echo -e "  - Monitor logs: ${GREEN}docker-compose logs -f${NC}"