# Netlify Deployment Guide for eKaty.com (Vite React SPA)

This guide provides step-by-step instructions for deploying the Vite React SPA eKaty.com to Netlify with GitHub continuous deployment.

## 🚀 Quick Deploy (Zero Configuration)

The project is now properly configured for Vite React SPA deployment. Just import from GitHub and deploy!

### Import from GitHub
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Choose GitHub and authorize Netlify
4. Select repository: `Swimhack/ekaty`
5. **Site settings are auto-detected from netlify.toml**
6. Click "Deploy site"

## 📋 Pre-configured Settings

All deployment settings are automatically configured via `netlify.toml`:

### Build Settings
- **Build command:** `npm run build`
- **Publish directory:** `dist` (Vite output directory)
- **Node version:** 18
- **SPA routing:** Configured with _redirects file

### Critical SPA Routing Configuration
The `/*` to `/index.html` redirect ensures React Router routes work correctly:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables
Copy these from `.env.netlify` to your Netlify site settings (using VITE_ prefix for Vite apps):

```bash
# Required - Supabase (corrected URL and keys)
VITE_SUPABASE_URL=https://sixzqokachwkcvsqpxoq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeHpxb2thY2h3a2N2c3FweG9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzc5NTUsImV4cCI6MjA1NzY1Mzk1NX0.7oUA3DNoEjihJ4eR9yNpTX3OeMT--uYTIZoN7o54goM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeHpxb2thY2h3a2N2c3FweG9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjA3Nzk1NSwiZXhwIjoyMDU3NjUzOTU1fQ.6JZVNCbl-zCOvbxf5e9G1XoXFsZdP3eCFbqlegIWR4c

# Required - Application (VITE_ prefix for client-side)
VITE_APP_URL=https://ekaty.com
VITE_APP_NAME=eKaty.com
NODE_ENV=production

# Required - Services (VITE_ prefix for client-side)
# Map uses free Leaflet + OpenStreetMap (no API key needed)
VITE_GOOGLE_PLACES_API_KEY=AIzaSyA7Ic5d7Uzr8XgYBPWtMB4Z8UDFnjpWypo
GOOGLE_PLACES_API_KEY=AIzaSyA7Ic5d7Uzr8XgYBPWtMB4Z8UDFnjpWypo
```

## 🔧 Manual Configuration (if needed)

If you need to manually configure settings:

### Build & Deploy Settings
```
Base directory: (leave blank)
Build command: npm run build
Publish directory: out
Functions directory: netlify/functions
```

### Deploy Contexts
- **Production branch:** main
- **Deploy previews:** Enabled for pull requests
- **Branch deploys:** Enabled for all branches

## 🌐 Domain Configuration

### Custom Domain (ekaty.com)
1. Go to Site settings > Domain management
2. Add custom domain: `ekaty.com`
3. Add domain alias: `www.ekaty.com`
4. Configure DNS records at your registrar:
   ```
   CNAME record: ekaty.com -> your-site-name.netlify.app
   CNAME record: www.ekaty.com -> your-site-name.netlify.app
   ```

### SSL Certificate
- Automatic HTTPS via Let's Encrypt
- Force HTTPS redirect enabled
- HSTS headers configured

## 📁 File Structure for Netlify

```
ekaty-modern/
├── netlify.toml              # Main configuration
├── public/_redirects         # SPA routing rules
├── netlify/
│   └── functions/
│       └── api.js           # Serverless functions
├── .env.netlify             # Environment template
├── next.config.js           # Next.js + Netlify config
└── docs/
    └── NETLIFY-DEPLOYMENT.md # This guide
```

## 🔄 Continuous Deployment

### Automatic Deploys
- **Production:** Push to `main` branch
- **Preview:** Create pull request
- **Branch:** Push to any branch

### Build Process
1. Install dependencies: `npm install`
2. Run build: `npm run build`
3. Generate static export: Next.js creates `out/` directory
4. Deploy to Netlify CDN

### Build Performance
- **Average build time:** 2-3 minutes
- **Cache optimization:** Node modules cached between builds
- **Asset optimization:** Automatic image and JS/CSS minification

## 🛠️ Environment-Specific Configuration

### Production
```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_APP_URL=https://ekaty.com
```

### Deploy Previews
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://deploy-preview-X--your-site.netlify.app
```

### Branch Deploys
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://branch-name--your-site.netlify.app
```

## 🔒 Security Headers

Auto-configured security headers:
- **X-Frame-Options:** DENY
- **X-XSS-Protection:** 1; mode=block
- **X-Content-Type-Options:** nosniff
- **Referrer-Policy:** strict-origin-when-cross-origin
- **Permissions-Policy:** Restricted camera, microphone, geolocation

## 📊 Performance Optimization

### Caching Strategy
- **Static assets:** 1 year cache (`/_next/static/*`)
- **Images:** 7 days cache (`/images/*`)
- **HTML:** No cache (always fresh)
- **API routes:** No cache

### CDN Distribution
- Global CDN with 100+ edge locations
- Automatic image optimization
- Brotli compression enabled
- HTTP/2 and HTTP/3 support

## 🔍 Monitoring & Analytics

### Build Monitoring
- Build logs available in Netlify dashboard
- Email notifications for failed builds
- Slack/Discord webhooks supported

### Site Analytics
- Netlify Analytics available (paid feature)
- Google Analytics integration ready
- Core Web Vitals monitoring

## 🚨 Troubleshooting

### Common Issues

1. **Build fails with "Module not found"**
   ```bash
   # Solution: Check dependencies in package.json
   npm install
   npm run build  # Test locally first
   ```

2. **Environment variables not working**
   ```bash
   # Solution: Verify in Site settings > Environment variables
   # Ensure NEXT_PUBLIC_ prefix for client-side variables
   ```

3. **404 errors on page refresh**
   ```bash
   # Solution: Already configured in _redirects and netlify.toml
   # Ensures SPA routing works correctly
   ```

4. **API routes returning 404**
   ```bash
   # Solution: Check netlify/functions/api.js
   # Ensure proper API route configuration
   ```

### Debug Steps
1. Check build logs in Netlify dashboard
2. Test build locally: `npm run build`
3. Verify environment variables are set
4. Check function logs for API issues

## 📋 Deployment Checklist

Before going live:

- [ ] Environment variables configured
- [ ] Custom domain added and verified
- [ ] SSL certificate active
- [ ] Build successful and tested
- [ ] API endpoints working
- [ ] Database connection verified
- [ ] Email functionality tested
- [ ] Google Maps integration working
- [ ] Mobile responsiveness checked
- [ ] SEO meta tags verified

## 🎯 Next Steps

After successful deployment:

1. **Configure Analytics**
   ```bash
   # Add Google Analytics ID
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

2. **Set up Monitoring**
   - Uptime monitoring (UptimeRobot, Pingdom)
   - Error tracking (Sentry)
   - Performance monitoring

3. **SEO Optimization**
   - Submit sitemap to Google Search Console
   - Configure robots.txt
   - Set up structured data

4. **Performance Tuning**
   - Enable Netlify Analytics
   - Configure caching strategies
   - Optimize images and assets

## 📞 Support

For deployment issues:
- Check Netlify docs: https://docs.netlify.com
- Netlify support: https://support.netlify.com
- GitHub repository: https://github.com/Swimhack/ekaty

---

**Built for seamless deployment - just import and go! 🚀**