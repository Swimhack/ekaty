# eKaty.com Deployment Guide

## 🚀 Quick Start Deployment

The modern eKaty.com application is now ready for deployment! This guide will walk you through the complete deployment process to Digital Ocean.

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Digital Ocean Account** with SSH access to your droplet
2. **Supabase Project** set up with the provided schema
3. **Resend Account** for email functionality
4. **Domain Name** pointed to your server (ekaty.com)
5. **SSL Certificate** (Let's Encrypt recommended)

## 🗄️ Database Setup

### 1. Supabase Configuration

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Run Database Migration**:
   ```sql
   -- In Supabase SQL Editor, run:
   -- Copy and paste content from supabase/migrations/001_initial_schema.sql
   ```

3. **Seed Initial Data**:
   ```sql
   -- Copy and paste content from supabase/seed.sql
   ```

4. **Configure Row Level Security**:
   - RLS policies are included in the migration
   - Verify they're active in Supabase dashboard

### 2. Environment Variables

Update `.env.local` with your production values:

```bash
# Required for deployment
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
RESEND_API_KEY=re_37YYP2iE_KbLqkdskcjngf9XqFMJZv1xG
NEXT_PUBLIC_APP_URL=https://ekaty.com
NEXT_PUBLIC_APP_NAME=eKaty.com

# Optional but recommended
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
GOOGLE_PLACES_API_KEY=your_google_places_key
NEXTAUTH_SECRET=your_secure_random_string
```

## 🖥️ Server Preparation

### 1. Digital Ocean Droplet Setup

```bash
# Create Ubuntu 20.04+ droplet (minimum 2GB RAM recommended)
# SSH into your server

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for docker group changes
exit
```

### 2. SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d ekaty.com -d www.ekaty.com

# Create SSL directory in project
mkdir -p /opt/ekaty/ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/ekaty.com/fullchain.pem /opt/ekaty/ssl/ekaty.com.crt
sudo cp /etc/letsencrypt/live/ekaty.com/privkey.pem /opt/ekaty/ssl/ekaty.com.key
sudo chown -R $USER:$USER /opt/ekaty/ssl
```

## 📦 Application Deployment

### 1. Deploy Application Files

```bash
# Create application directory
sudo mkdir -p /opt/ekaty
sudo chown -R $USER:$USER /opt/ekaty

# Copy application files (replace with your method)
# Option A: Git clone (if repository is set up)
cd /opt/ekaty
git clone [repository-url] .

# Option B: SCP from local machine
scp -r ekaty-modern/* user@your-server:/opt/ekaty/

# Option C: rsync for faster transfers
rsync -avz ekaty-modern/ user@your-server:/opt/ekaty/
```

### 2. Configure Environment

```bash
cd /opt/ekaty

# Set up environment variables
cp .env.local.example .env.local
nano .env.local  # Edit with your production values

# Make deployment script executable
chmod +x deploy.sh
```

### 3. Run Deployment

```bash
# Execute the deployment script
./deploy.sh
```

The deployment script will:
- ✅ Check prerequisites
- ✅ Create backup of existing deployment
- ✅ Build Docker containers
- ✅ Start services with health checks
- ✅ Configure logging and monitoring
- ✅ Clean up old resources

## 🔍 Verification

### 1. Check Services

```bash
# View running containers
docker-compose ps

# Check application logs
docker-compose logs -f ekaty-app

# Check nginx logs
docker-compose logs -f nginx

# Test health endpoint
curl -f https://ekaty.com/api/health
```

### 2. Verify Functionality

1. **Website Access**: Visit https://ekaty.com
2. **SSL Certificate**: Verify green padlock in browser
3. **Newsletter Signup**: Test email subscription
4. **Search Functionality**: Try restaurant search
5. **Mobile Responsiveness**: Test on mobile devices

## 🔧 Post-Deployment Configuration

### 1. Database Population

The application is ready for real data! You can:

1. **Import Legacy Data**: Use the migration scripts to import from the old PHP system
2. **Add Restaurant Data**: Use the admin panel to add restaurants
3. **Google Places Integration**: Configure to automatically pull restaurant data

### 2. Enable Full Features

Uncomment and configure these features in the codebase:

```typescript
// In app/api/newsletter/subscribe/route.ts
// Uncomment database operations

// In components/layout/Header.tsx  
// Uncomment authentication features

// In app/page.tsx
// Replace mock data with real Supabase queries
```

### 3. Admin Setup

1. Create admin user in Supabase
2. Add entry to `admin_users` table
3. Access admin panel at `/admin` (to be implemented)

## 📊 Monitoring & Maintenance

### 1. Log Monitoring

```bash
# View application logs
tail -f /var/log/ekaty-deploy.log

# View real-time container logs
docker-compose logs -f

# Check disk usage
df -h
```

### 2. Backup Strategy

```bash
# Manual backup
./deploy.sh backup-only

# Set up automated backups
sudo crontab -e
# Add: 0 2 * * * /opt/ekaty/backup.sh
```

### 3. Updates

```bash
# Update application
cd /opt/ekaty
git pull origin main  # or upload new files
./deploy.sh

# Update system packages
sudo apt update && sudo apt upgrade -y
docker image prune -a -f  # Clean old images
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**:
   ```bash
   # Check environment variables
   cat .env.local
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

2. **SSL Issues**:
   ```bash
   # Renew certificate
   sudo certbot renew
   
   # Copy new certificates
   sudo cp /etc/letsencrypt/live/ekaty.com/* /opt/ekaty/ssl/
   docker-compose restart nginx
   ```

3. **Database Connection**:
   ```bash
   # Test Supabase connection
   curl -H "apikey: your_anon_key" https://your-project.supabase.co/rest/v1/restaurants
   ```

4. **Email Not Working**:
   ```bash
   # Check Resend API key
   curl -H "Authorization: Bearer re_your_key" https://api.resend.com/emails
   ```

### Rollback Procedure

```bash
# If deployment fails, rollback to previous version
cd /opt/ekaty
docker-compose down

# Restore from backup
tar -xzf /opt/backups/ekaty/ekaty-backup-YYYYMMDD-HHMMSS.tar.gz

# Restart services
docker-compose up -d
```

## 📈 Performance Optimization

### 1. CDN Setup (Optional)

Consider adding Cloudflare for:
- Static asset caching
- DDoS protection
- Additional SSL layer
- Global content delivery

### 2. Database Optimization

- Monitor query performance in Supabase
- Add database indexes as needed
- Set up read replicas for high traffic

### 3. Monitoring

- Set up Uptime Robot for availability monitoring
- Configure Supabase alerts for database issues
- Monitor Docker container resource usage

## 🎉 Success!

Your modern eKaty.com application is now live! The application includes:

✅ **Modern Tech Stack**: Next.js 14, React 18, TypeScript, Tailwind CSS  
✅ **Scalable Database**: Supabase with Row Level Security  
✅ **Email Integration**: Resend API for transactional emails  
✅ **Production Ready**: Docker containerization with Nginx  
✅ **Security**: HTTPS, rate limiting, input validation  
✅ **Monitoring**: Health checks and comprehensive logging  
✅ **Mobile Optimized**: Responsive design for all devices  

## 📞 Support

For deployment issues or questions:
- Review logs: `/var/log/ekaty-deploy.log`
- Check GitHub issues: [repository-url]/issues
- Contact: james@stricklandtechnology.com

---

**Built with ❤️ by James Strickland - Strickland Technology**