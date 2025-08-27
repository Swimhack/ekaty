# eKaty.com Deployment Guide

## Overview
This guide explains the optimized deployment workflow for eKaty.com using Netlify and GitHub Actions.

## Prerequisites
- GitHub account with repository access
- Netlify account
- Node.js 18+ installed locally

## Setup Instructions

### 1. Environment Variables

#### GitHub Secrets (for CI/CD)
Add these secrets in your GitHub repository settings:
```
NETLIFY_AUTH_TOKEN=your_netlify_personal_access_token
NETLIFY_SITE_ID=your_netlify_site_id
```

#### Netlify Environment Variables
Set these in your Netlify dashboard under Site Settings > Environment Variables:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NODE_VERSION=18
```

#### Local Development
Copy `.env.example` to `.env.local` and fill in your actual values:
```bash
cp .env.example .env.local
# Edit .env.local with your actual credentials
```

### 2. Netlify Configuration

The repository includes a `netlify.toml` file with:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect rules for React Router
- Security headers
- Asset caching rules

### 3. GitHub Actions Workflows

Two workflows are configured:

#### CI Pipeline (`.github/workflows/ci.yml`)
- Runs on every push and pull request
- Type checking with TypeScript
- Linting (if available)
- Build verification
- Security audits on PRs

#### Deployment Pipeline (`.github/workflows/deploy.yml`)
- Builds and deploys to Netlify
- Preview deployments for PRs
- Production deployments for main branch
- Automatic PR comments with deployment URLs

### 4. Deployment Process

#### Automatic Deployment (Recommended)
1. Push changes to any branch
2. GitHub Actions runs CI checks
3. If on main branch → Production deployment
4. If on feature branch → Preview deployment
5. Netlify handles the actual deployment

#### Manual Deployment (Backup)
```bash
# Build locally
npm run build

# Deploy using Netlify CLI
npx netlify deploy --prod --dir=dist
```

## Best Practices

### 1. Clean Repository Management
- Never commit sensitive files (use .gitignore)
- Don't commit build artifacts (dist/ directory)
- Use environment variables for all secrets

### 2. Development Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and test locally
npm run dev

# Commit and push
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Create PR → Automatic preview deployment
# Merge PR → Automatic production deployment
```

### 3. Rollback Process
If deployment fails or has issues:
1. Go to Netlify dashboard
2. Navigate to Deploys tab
3. Click on previous successful deploy
4. Click "Publish deploy" to rollback

## Monitoring and Troubleshooting

### Build Logs
- GitHub Actions: Check Actions tab in repository
- Netlify: Check Deploys > Deploy details

### Common Issues

#### Build Failures
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check TypeScript compilation errors

#### Environment Variable Issues
- Ensure all required variables are set in Netlify
- Variables starting with VITE_ are available in frontend
- Service role keys should only be used server-side

#### Deploy Failures
- Check build command matches package.json scripts
- Verify publish directory is set to 'dist'
- Check for any missing dependencies

### Performance Monitoring
- Netlify Analytics (if enabled)
- Lighthouse reports in GitHub Actions
- Core Web Vitals monitoring

## Security

### Environment Variables
- Never commit .env files
- Use different keys for development/production
- Rotate keys periodically

### Build Security
- GitHub push protection enabled
- Dependency vulnerability scanning
- Automated security audits

## Getting Help

1. Check GitHub Actions logs for CI/CD issues
2. Check Netlify deploy logs for deployment issues
3. Review this guide for configuration problems
4. Check the repository issues for known problems

## Migration from Previous Setup

If migrating from a previous deployment setup:
1. Remove any old deployment scripts
2. Clear build caches in Netlify
3. Update environment variables
4. Test with a small change first
5. Monitor first few deployments closely

---

Last updated: $(date)
Generated with [Claude Code](https://claude.ai/code)