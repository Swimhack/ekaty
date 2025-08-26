# Production Deployment Guide for eKaty.com

## Critical Environment Variable Fixes Applied

### Issues Resolved:
1. **Fixed Supabase Configuration**: Removed hardcoded fallback values that were causing authentication failures
2. **Updated Environment Variables**: Changed from NEXT_PUBLIC_ to VITE_ prefixes (correct for Vite/React apps)
3. **Added Missing Variables**: Added VITE_GOOGLE_PLACES_API_KEY for Google Places API integration
4. **Fixed Docker Configuration**: Updated Dockerfile and docker-compose.yml to include all required environment variables
5. **Updated Deployment Scripts**: Fixed validation to check VITE_ prefixed variables instead of NEXT_PUBLIC_

### Key Configuration Files Updated:
- `.env.production` - Production environment variables
- `lib/supabase.ts` - Removed hardcoded fallbacks, now properly throws errors if env vars missing
- `Dockerfile` - Added VITE_GOOGLE_PLACES_API_KEY build argument
- `docker-compose.yml` - Added missing Google Places API key
- `deploy.sh` - Fixed environment variable validation

## Production Deployment Steps

### 1. Environment Variable Setup

Run the production environment setup script:
```bash
./setup-production-env.sh
```

This script will:
- Validate all required environment variables
- Test Supabase connection
- Create `.env.docker` file for deployment
- Verify API key formats

### 2. Required Environment Variables

The following environment variables must be set in `.env.production`:

```bash
# Supabase Configuration - PRODUCTION
VITE_SUPABASE_URL=https://sixzqokachwkcvsqpxoq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeHpxb2thY2h3a2N2c3FweG9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzc5NTUsImV4cCI6MjA1NzY1Mzk1NX0.7oUA3DNoEjihJ4eR9yNpTX3OeMT--uYTIZoN7o54goM

# App Configuration
VITE_APP_URL=https://ekaty.com
VITE_APP_NAME=eKaty.com
NODE_ENV=production

# Google Services Configuration
VITE_GOOGLE_MAPS_API_KEY=AIzaSyA7Ic5d7Uzr8XgYBPWtMB4Z8UDFnjpWypo
VITE_GOOGLE_PLACES_API_KEY=AIzaSyA7Ic5d7Uzr8XgYBPWtMB4Z8UDFnjpWypo

# Server-side environment variables (not exposed to client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeHpxb2thY2h3a2N2c3FweG9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjA3Nzk1NSwiZXhwIjoyMDU3NjUzOTU1fQ.6JZVNCbl-zCOvbxf5e9G1XoXFsZdP3eCFbqlegIWR4c
GOOGLE_PLACES_API_KEY=AIzaSyA7Ic5d7Uzr8XgYBPWtMB4Z8UDFnjpWypo
```

### 3. Build and Deploy

#### Option A: Using Docker Compose (Recommended)
```bash
# 1. Setup environment
./setup-production-env.sh

# 2. Build and deploy
docker-compose --env-file .env.docker up -d --build

# 3. Check status
docker-compose ps

# 4. View logs
docker-compose logs -f
```

#### Option B: Using Deployment Script
```bash
# Run the deployment script (will use .env.local)
./deploy.sh
```

### 4. Health Checks

After deployment, verify:

1. **Application is running**:
   ```bash
   curl -f http://localhost/
   ```

2. **Environment variables are loaded**:
   Check browser console for any environment variable errors

3. **Supabase connection**:
   Check that authentication and data loading work properly

4. **Google Places API**:
   Verify restaurant search and location features work

### 5. Troubleshooting

#### Common Issues and Solutions:

**1. Authentication Errors (Stream connection errors)**:
- **Cause**: Missing or incorrect VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY
- **Solution**: Verify environment variables are set correctly, no hardcoded fallbacks will mask the issue now

**2. API Key "dz5f4d5kzrue" Authentication Failures**:
- **Cause**: This appears to be a generic/test API key, likely from a service not properly configured
- **Solution**: Check all API integrations and ensure production keys are used

**3. Environment Variables Not Loading**:
- **Cause**: Variables not prefixed with VITE_ or build-time variables not passed correctly
- **Solution**: All client-side variables must use VITE_ prefix and be included in Docker build args

**4. Docker Build Failures**:
- **Cause**: Missing environment variables during build
- **Solution**: Ensure all VITE_ variables are included in Dockerfile ARG and ENV statements

### 6. Monitoring and Logs

Monitor the application:

```bash
# View application logs
docker-compose logs -f ekaty-app

# Check container status
docker-compose ps

# View Docker system info
docker system df

# Clean up old images
docker system prune -a
```

### 7. Rollback Procedure

If deployment fails:

```bash
# Stop current deployment
docker-compose down

# Restore from backup (if available)
cd backups
tar -xzf latest-backup.tar.gz

# Redeploy previous version
docker-compose up -d
```

## Security Notes

1. **Never commit environment files**: .env.docker and .env.production should not be committed
2. **Use HTTPS**: All production URLs must use HTTPS
3. **Rotate API Keys**: Regularly rotate Supabase and Google API keys
4. **Monitor Access**: Watch logs for unusual access patterns

## Environment Variable Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| VITE_SUPABASE_URL | Yes | Supabase project URL | https://xyz.supabase.co |
| VITE_SUPABASE_ANON_KEY | Yes | Supabase anonymous key | eyJhbGciOiJIUzI1NiI... |
| VITE_APP_URL | Yes | Production app URL | https://ekaty.com |
| VITE_APP_NAME | Yes | Application name | eKaty.com |
| VITE_GOOGLE_PLACES_API_KEY | Yes | Google Places API key | AIzaSyA7Ic5d7... |
| VITE_GOOGLE_MAPS_API_KEY | Yes | Google Maps API key | AIzaSyA7Ic5d7... |
| SUPABASE_SERVICE_ROLE_KEY | Yes | Server-side Supabase key | eyJhbGciOiJIUzI1NiI... |
| GOOGLE_PLACES_API_KEY | Yes | Server-side Google key | AIzaSyA7Ic5d7... |
| NODE_ENV | Yes | Environment mode | production |

## Contact and Support

For deployment issues or questions, check:
1. Application logs: `docker-compose logs -f`
2. Supabase dashboard for API usage and errors
3. Google Cloud Console for API quotas and errors