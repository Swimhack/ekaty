#!/bin/bash

# eKaty.com Deployment Script for Digital Ocean
# Run this script to deploy the application to production

set -e

echo "🚀 Starting eKaty.com deployment..."

# Configuration
APP_NAME="ekaty-modern"
DOCKER_IMAGE="ekaty-com:latest"
BACKUP_DIR="./backups"
LOG_FILE="./ekaty-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# Error handling
error_exit() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    log "ERROR: $1"
    exit 1
}

# Success message
success() {
    echo -e "${GREEN}✅ $1${NC}"
    log "SUCCESS: $1"
}

# Warning message
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    log "WARNING: $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error_exit "This script should not be run as root for security reasons"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    command -v docker >/dev/null 2>&1 || error_exit "Docker is not installed"
    command -v docker-compose >/dev/null 2>&1 || error_exit "Docker Compose is not installed"
    command -v git >/dev/null 2>&1 || error_exit "Git is not installed"
    
    # Check if user is in docker group
    if ! groups $USER | grep -q docker; then
        error_exit "User $USER is not in the docker group. Run: sudo usermod -aG docker $USER"
    fi
    
    success "Prerequisites check passed"
}

# Create backup
create_backup() {
    if [ -f "docker-compose.yml" ]; then
        log "Creating backup..."
        mkdir -p $BACKUP_DIR
        backup_name="ekaty-backup-$(date +%Y%m%d-%H%M%S)"
        
        # Stop services gracefully
        docker-compose down --timeout 30 || warning "Failed to stop services gracefully"
        
        # Create backup archive
        tar -czf "$BACKUP_DIR/$backup_name.tar.gz" \
            docker-compose.yml \
            .env.local \
            nginx.conf \
            --exclude=node_modules \
            --exclude=.next \
            --exclude=.git \
            || warning "Backup creation failed"
        
        success "Backup created: $backup_name.tar.gz"
    fi
}

# Load environment variables
load_environment() {
    if [ ! -f ".env.local" ]; then
        error_exit ".env.local file not found. Please create it from .env.local.example"
    fi
    
    # Validate required environment variables
    required_vars=(
        "VITE_SUPABASE_URL"
        "VITE_SUPABASE_ANON_KEY"
        "VITE_APP_URL"
        "VITE_APP_NAME"
        "VITE_GOOGLE_PLACES_API_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "GOOGLE_PLACES_API_KEY"
    )
    
    source .env.local
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error_exit "Required environment variable $var is not set"
        fi
    done
    
    success "Environment variables loaded and validated"
}

# Build and deploy
build_and_deploy() {
    log "Building and deploying application..."
    
    # Pull latest code (if this is a git repository)
    if [ -d ".git" ]; then
        git pull origin main || warning "Failed to pull latest code"
    fi
    
    # Build the application
    docker-compose build --no-cache || error_exit "Docker build failed"
    
    # Start services
    docker-compose up -d || error_exit "Failed to start services"
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    timeout=300  # 5 minutes
    elapsed=0
    
    while [ $elapsed -lt $timeout ]; do
        if docker-compose ps | grep -q "Up (healthy)"; then
            success "Services are healthy"
            break
        fi
        
        if [ $elapsed -eq $timeout ]; then
            error_exit "Services failed to become healthy within $timeout seconds"
        fi
        
        sleep 10
        elapsed=$((elapsed + 10))
        echo "Waiting... ($elapsed/$timeout seconds)"
    done
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Check if the application responds
    if command -v curl >/dev/null 2>&1; then
        if curl -f -s "http://localhost:3000/api/health" >/dev/null; then
            success "Application health check passed"
        else
            error_exit "Application health check failed"
        fi
    else
        warning "curl not available, skipping HTTP health check"
    fi
    
    # Check Docker services
    if docker-compose ps | grep -q "Exit"; then
        docker-compose ps
        error_exit "Some services have exited"
    fi
    
    success "All health checks passed"
}

# Cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    
    # Remove unused images older than 7 days
    docker image prune -a -f --filter "until=168h" || warning "Failed to clean up old images"
    
    # Remove unused volumes
    docker volume prune -f || warning "Failed to clean up volumes"
    
    success "Cleanup completed"
}

# Setup log rotation
setup_logging() {
    log "Setting up log rotation..."
    
    # Create logrotate configuration
    sudo tee /etc/logrotate.d/ekaty >/dev/null <<EOF
$LOG_FILE {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
EOF
    
    success "Log rotation configured"
}

# Main deployment function
main() {
    log "Starting eKaty.com deployment process"
    
    check_root
    check_prerequisites
    load_environment
    create_backup
    build_and_deploy
    health_check
    cleanup
    setup_logging
    
    success "🎉 Deployment completed successfully!"
    log "eKaty.com is now running at: $VITE_APP_URL"
    
    echo ""
    echo "📊 Deployment Summary:"
    echo "- Application URL: $VITE_APP_URL"
    echo "- Log file: $LOG_FILE"
    echo "- Backup directory: $BACKUP_DIR"
    echo ""
    echo "🔧 Useful commands:"
    echo "- View logs: docker-compose logs -f"
    echo "- Restart services: docker-compose restart"
    echo "- Stop services: docker-compose down"
    echo "- View status: docker-compose ps"
}

# Run main function
main "$@"