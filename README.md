# eKaty.com - Modern Restaurant Directory

A modern, AI-powered restaurant directory for Katy, Texas, built with Next.js, Supabase, and TypeScript.

## 🚀 Features

- **Modern Stack**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with social login support
- **Email**: Resend API for transactional emails
- **Search**: Advanced restaurant search with filters
- **Reviews**: Complete review and rating system
- **Admin Panel**: Restaurant and user management
- **Mobile-First**: Responsive design for all devices
- **SEO Optimized**: Server-side rendering and meta tags
- **Logging**: Comprehensive application logging system
- **Deployment**: Docker-ready with Digital Ocean configuration

## 🏗️ Architecture

### Frontend
- **Next.js 14** with App Router
- **React 18** with hooks and context
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Supabase** for database and auth
- **PostgreSQL** with RLS policies
- **Edge Functions** for serverless logic
- **Resend** for email delivery

### Infrastructure
- **Docker** containerization
- **Nginx** reverse proxy
- **SSL/TLS** termination
- **Digital Ocean** hosting

## 📦 Installation

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Supabase account
- Resend account

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd ekaty-modern
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
# Edit .env.local with your actual values
```

4. **Set up Supabase database**
```bash
# Run the migration
psql -h <supabase-host> -U postgres -d postgres -f supabase/migrations/001_initial_schema.sql

# Seed initial data
psql -h <supabase-host> -U postgres -d postgres -f supabase/seed.sql
```

5. **Start development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🚀 Deployment

### Digital Ocean Deployment

1. **Prepare your server**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Deploy the application**
```bash
# Copy files to server
scp -r . user@your-server:/opt/ekaty/

# SSH to server
ssh user@your-server

# Navigate to app directory
cd /opt/ekaty

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with production values

# Run deployment script
./deploy.sh
```

3. **Set up SSL certificates**
```bash
# Using Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d ekaty.com -d www.ekaty.com

# Copy certificates to the SSL directory
sudo cp /etc/letsencrypt/live/ekaty.com/fullchain.pem ssl/ekaty.com.crt
sudo cp /etc/letsencrypt/live/ekaty.com/privkey.pem ssl/ekaty.com.key
```

## 🗄️ Database Schema

The application uses a comprehensive PostgreSQL schema with the following main tables:

- **restaurants** - Restaurant information and metadata
- **reviews** - User reviews with ratings
- **cuisines** - Restaurant cuisine types
- **areas** - Katy geographic areas
- **user_profiles** - Extended user information
- **user_favorites** - User's favorite restaurants
- **admin_users** - Administrative users
- **application_logs** - System logging
- **newsletter_subscriptions** - Email subscriptions

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `RESEND_API_KEY` | Resend email API key | Yes |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key | No |
| `GOOGLE_PLACES_API_KEY` | Google Places API key | No |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | No |
| `STRIPE_SECRET_KEY` | Stripe secret key | No |

### Supabase Configuration

1. **Database Setup**: Run the migration scripts in `supabase/migrations/`
2. **Row Level Security**: Policies are automatically created
3. **Storage**: Configure buckets for restaurant images
4. **Auth**: Enable desired authentication providers

### Email Configuration

Configure Resend with:
- Domain verification
- DKIM setup
- Template customization

## 📱 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `POST /api/newsletter/subscribe` - Newsletter subscription
- `GET /api/restaurants` - Restaurant listings
- `GET /api/restaurants/[id]` - Restaurant details
- `GET /api/reviews` - Review listings

### Protected Endpoints
- `POST /api/reviews` - Create review
- `PUT /api/reviews/[id]` - Update review
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/[id]` - Remove from favorites

### Admin Endpoints
- `POST /api/admin/restaurants` - Create restaurant
- `PUT /api/admin/restaurants/[id]` - Update restaurant
- `DELETE /api/admin/restaurants/[id]` - Delete restaurant
- `GET /api/admin/logs` - View application logs

## 🧪 Testing

```bash
# Run tests
npm test

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run build test
npm run build
```

## 📊 Monitoring

### Application Logs
- Database queries and errors
- User actions and conversions
- API endpoint usage
- Security events

### Health Checks
- Database connectivity
- External service availability
- Application performance

### Metrics
- User engagement
- Restaurant views
- Review submissions
- Newsletter subscriptions

## 🔒 Security

### Implementation
- Row Level Security (RLS) on all tables
- Input validation and sanitization
- Rate limiting on API endpoints
- HTTPS encryption
- Secure session management

### Best Practices
- Regular security updates
- Environment variable protection
- Database backup strategy
- Access logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**James Strickland**
- Website: [stricklandtechnology.com](https://stricklandtechnology.com)
- Email: james@stricklandtechnology.com

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend-as-a-service platform
- Tailwind CSS for the utility-first CSS framework
- The Katy, Texas community for inspiration

---

Built with ❤️ in Katy, Texas