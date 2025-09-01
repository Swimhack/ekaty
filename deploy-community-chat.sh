#!/bin/bash

# Deploy Community Chat Edge Function to Supabase
# This script deploys the community-chat function and sets up the database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI is not installed. Please install it first:"
        print_error "npm install -g supabase"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install it first."
        exit 1
    fi
    
    print_success "Requirements check passed"
}

# Check if we're in a Supabase project
check_supabase_project() {
    print_status "Checking if we're in a Supabase project..."
    
    if [ ! -f "supabase/config.toml" ]; then
        print_error "Not in a Supabase project. Please run 'supabase init' first."
        exit 1
    fi
    
    print_success "Supabase project found"
}

# Deploy the Edge Function
deploy_function() {
    print_status "Deploying community-chat Edge Function..."
    
    if [ ! -d "supabase/functions/community-chat" ]; then
        print_error "Community chat function not found. Please ensure the function exists."
        exit 1
    fi
    
    # Deploy the function
    supabase functions deploy community-chat --no-verify-jwt
    
    if [ $? -eq 0 ]; then
        print_success "Community chat function deployed successfully"
    else
        print_error "Failed to deploy community chat function"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    if [ ! -f "supabase/migrations/001_create_community_tables.sql" ]; then
        print_error "Migration file not found. Please ensure migrations exist."
        exit 1
    fi
    
    # Reset the database to apply migrations
    print_warning "This will reset your local database. Make sure you have backups if needed."
    read -p "Continue? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        supabase db reset
        
        if [ $? -eq 0 ]; then
            print_success "Database migrations applied successfully"
        else
            print_error "Failed to apply database migrations"
            exit 1
        fi
    else
        print_warning "Skipping database reset. You may need to manually apply migrations."
    fi
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Get the function URL
    local function_url=$(supabase functions list --json | jq -r '.[] | select(.name=="community-chat") | .url')
    
    if [ -z "$function_url" ]; then
        print_error "Could not find function URL"
        return 1
    fi
    
    print_status "Function URL: $function_url"
    
    # Test the health endpoint
    local health_response=$(curl -s "$function_url/health" 2>/dev/null || echo "FAILED")
    
    if [ "$health_response" != "FAILED" ]; then
        local status=$(echo "$health_response" | jq -r '.status' 2>/dev/null || echo "unknown")
        if [ "$status" = "healthy" ]; then
            print_success "Function health check passed"
            return 0
        fi
    fi
    
    print_warning "Function health check failed or returned unexpected response"
    return 1
}

# Set up environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    # Check if .env file exists
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local file not found. Creating template..."
        cat > .env.local << EOF
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Community Chat Configuration
VITE_COMMUNITY_CHAT_FUNCTION=community-chat
EOF
        print_warning "Please update .env.local with your actual Supabase credentials"
    else
        print_success ".env.local file found"
    fi
}

# Main deployment process
main() {
    print_status "Starting Community Chat deployment..."
    
    check_requirements
    check_supabase_project
    setup_environment
    deploy_function
    run_migrations
    verify_deployment
    
    print_success "Community Chat deployment completed!"
    print_status "Next steps:"
    print_status "1. Update your .env.local file with actual Supabase credentials"
    print_status "2. Test the chat functionality in your application"
    print_status "3. Configure any additional settings in Supabase dashboard"
}

# Run main function
main "$@"


