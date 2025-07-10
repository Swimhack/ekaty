#!/bin/bash

# Digital Ocean App Platform Deployment Script
# This script helps deploy eKaty.com to Digital Ocean App Platform

set -e

echo "🚀 Starting Digital Ocean App Platform deployment for eKaty.com..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
error_exit() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    exit 1
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if doctl is installed
check_doctl() {
    if ! command -v doctl &> /dev/null; then
        echo ""
        error_exit "doctl CLI is not installed. Please install it first:
        
        macOS: brew install doctl
        Linux: snap install doctl
        Windows: Download from https://github.com/digitalocean/doctl/releases
        
        Then authenticate: doctl auth init"
    fi
    success "doctl CLI found"
}

# Check authentication
check_auth() {
    info "Checking Digital Ocean authentication..."
    if ! doctl account get &> /dev/null; then
        error_exit "Not authenticated with Digital Ocean. Run: doctl auth init"
    fi
    success "Authenticated with Digital Ocean"
}

# Validate environment
validate_env() {
    info "Validating environment variables..."
    
    if [ ! -f ".env.local" ]; then
        error_exit ".env.local file not found. Please create it from .env.local.example"
    fi
    
    # Check required variables
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "RESEND_API_KEY"
    )
    
    source .env.local
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error_exit "Required environment variable $var is not set in .env.local"
        fi
    done
    
    success "Environment variables validated"
}

# Create or update app
deploy_app() {
    info "Deploying to Digital Ocean App Platform..."
    
    # Check if app already exists
    if doctl apps list --format Name | grep -q "ekaty-modern"; then
        info "App already exists. Updating..."
        
        # Get app ID
        APP_ID=$(doctl apps list --format ID,Name | grep "ekaty-modern" | awk '{print $1}')
        
        # Update app with new spec
        doctl apps update $APP_ID --spec app.yaml
        
        success "App updated successfully!"
    else
        info "Creating new app..."
        
        # Create app
        doctl apps create --spec app.yaml
        
        success "App created successfully!"
    fi
}

# Set environment variables
set_env_vars() {
    info "Setting environment variables in Digital Ocean..."
    
    # Get app ID
    APP_ID=$(doctl apps list --format ID,Name | grep "ekaty-modern" | awk '{print $1}')
    
    if [ -z "$APP_ID" ]; then
        error_exit "Could not find app ID"
    fi
    
    # Source environment variables
    source .env.local
    
    # Update environment variables
    info "Updating secret environment variables..."
    
    # Note: This is a simplified version. In production, you'd want to use
    # doctl apps update-env command or the Digital Ocean dashboard
    
    warning "Please set the following environment variables in the Digital Ocean App Platform dashboard:
    
    1. Go to: https://cloud.digitalocean.com/apps/$APP_ID/settings
    2. Click on the component (ekaty-web)
    3. Add the following environment variables:
    
    - NEXT_PUBLIC_SUPABASE_URL = $NEXT_PUBLIC_SUPABASE_URL
    - NEXT_PUBLIC_SUPABASE_ANON_KEY = $NEXT_PUBLIC_SUPABASE_ANON_KEY
    - SUPABASE_SERVICE_ROLE_KEY = [Set as encrypted/secret]
    - RESEND_API_KEY = [Set as encrypted/secret]
    - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = [If available]
    - GOOGLE_PLACES_API_KEY = [If available]
    - NEXTAUTH_SECRET = [Generate a random string]"
}

# Deploy process
main() {
    echo ""
    info "🚀 Digital Ocean App Platform Deployment for eKaty.com"
    echo ""
    
    # Pre-deployment checks
    check_doctl
    check_auth
    validate_env
    
    # Build check
    info "Running local build to verify..."
    npm run build || error_exit "Build failed. Please fix errors before deploying."
    success "Build successful"
    
    # Deploy
    deploy_app
    
    # Post-deployment
    set_env_vars
    
    echo ""
    success "🎉 Deployment initiated successfully!"
    echo ""
    info "Next steps:"
    echo "1. Set environment variables in the Digital Ocean dashboard"
    echo "2. Connect your GitHub repository if not already connected"
    echo "3. Add your custom domain (ekaty.com) in the app settings"
    echo "4. Monitor the deployment at: https://cloud.digitalocean.com/apps"
    echo ""
    info "Your app will be available at the temporary URL provided by Digital Ocean"
    info "until the custom domain is configured."
}

# Show help
show_help() {
    echo "Digital Ocean App Platform Deployment Script for eKaty.com"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  deploy    Deploy the application (default)"
    echo "  help      Show this help message"
    echo ""
    echo "Prerequisites:"
    echo "  - doctl CLI installed and authenticated"
    echo "  - .env.local file with required variables"
    echo "  - app.yaml file in the project root"
}

# Parse command
case "${1:-deploy}" in
    deploy)
        main
        ;;
    help)
        show_help
        ;;
    *)
        error_exit "Unknown command: $1"
        ;;
esac