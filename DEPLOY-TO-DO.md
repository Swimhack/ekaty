# Deploy eKaty.com to Digital Ocean App Platform

This guide will help you deploy the eKaty.com application to Digital Ocean App Platform.

## Option 1: Using Digital Ocean App Platform (Recommended)

### Prerequisites
1. Digital Ocean account
2. GitHub repository with your code
3. Environment variables from `.env.local`

### Step 1: Push Code to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for eKaty.com"

# Create a new repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/ekaty-modern.git
git branch -M main
git push -u origin main
```

### Step 2: Create App on Digital Ocean

1. Go to [Digital Ocean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Choose "GitHub" as source
4. Authorize Digital Ocean to access your GitHub
5. Select your repository and branch (main)
6. Click "Next"

### Step 3: Configure App Settings

1. **App Info**:
   - Name: `ekaty-modern`
   - Region: Choose closest to your users (e.g., NYC)

2. **Resources**:
   - Type: Web Service
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - HTTP Port: 3000
   - Instance Size: Basic ($5/month for testing, upgrade for production)

3. **Environment Variables** (Add these in the app settings):
   ```
   NODE_ENV=production
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> (mark as encrypted)
   RESEND_API_KEY=<your-resend-api-key> (mark as encrypted)
   NEXT_PUBLIC_APP_URL=https://ekaty.com
   NEXT_PUBLIC_APP_NAME=eKaty.com
   ```

### Step 4: Add Custom Domain

1. In App Settings, go to "Domains"
2. Add `ekaty.com` and `www.ekaty.com`
3. Update your domain's DNS records:
   - Add CNAME record pointing to the Digital Ocean app URL
   - Or use Digital Ocean's nameservers

### Step 5: Deploy

1. Click "Create Resources"
2. Digital Ocean will build and deploy your app
3. Monitor the build logs for any errors

## Option 2: Using Digital Ocean Droplet (Traditional VPS)

If you prefer more control, you can deploy to a Droplet:

### Step 1: Create Droplet
```bash
# Create Ubuntu 22.04 droplet (minimum 2GB RAM)
# Note the IP address
```

### Step 2: SSH and Setup
```bash
# SSH into droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Nginx
apt install nginx -y

# Create app directory
mkdir -p /var/www/ekaty
```

### Step 3: Deploy Code
```bash
# On your local machine
rsync -avz --exclude node_modules --exclude .next ./ root@your-droplet-ip:/var/www/ekaty/

# On the droplet
cd /var/www/ekaty
npm install
npm run build
```

### Step 4: Configure PM2
```bash
# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'ekaty',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/ekaty',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start app with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 5: Configure Nginx
```bash
# Create Nginx config
cat > /etc/nginx/sites-available/ekaty << EOF
server {
    listen 80;
    server_name ekaty.com www.ekaty.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/ekaty /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 6: Setup SSL
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d ekaty.com -d www.ekaty.com
```

## Verification

After deployment, verify:

1. ✅ Site loads at your domain
2. ✅ SSL certificate is valid
3. ✅ Newsletter signup works
4. ✅ Search functionality works
5. ✅ Mobile responsive

## Monitoring

- App Platform: Check logs in Digital Ocean dashboard
- Droplet: Use `pm2 logs` and `nginx -t`

## Support

For issues:
- Check build logs
- Verify environment variables
- Ensure Supabase connection works
- Test locally with production env vars