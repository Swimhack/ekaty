# Puppeteer Integration for eKaty.com

Puppeteer has been successfully installed in the eKaty.com project to enable browser automation capabilities for restaurant data scraping and website analysis.

## 🚀 Installation Status

- ✅ Puppeteer v24.12.1 installed
- ✅ TypeScript types installed 
- ✅ Serverless Chrome runtime (@sparticuz/chromium) installed
- ✅ Utility functions created
- ✅ API endpoints created
- ⚠️ Chrome dependencies require system installation

## 📁 Files Created

### Core Library
- `lib/puppeteer-utils.ts` - Main utility class with scraping functions
- `app/api/scrape/restaurants/route.ts` - API for scraping Google Places
- `app/api/scrape/website/route.ts` - API for scraping restaurant websites

### Setup & Documentation
- `setup-puppeteer.sh` - Chrome dependencies installation script
- `docs/PUPPETEER.md` - This documentation file

## 🔧 System Requirements

To use Puppeteer, you need Chrome browser dependencies installed:

```bash
# Run the setup script
./setup-puppeteer.sh

# Or install manually on Ubuntu/Debian:
sudo apt install -y libnss3-dev libgconf-2-4 libxss1 libxtst6 libxrandr2 libasound2-dev libpangocairo-1.0-0 libatk1.0-0 libcairo-gobject2 libgtk-3-0 libgdk-pixbuf2.0-0
```

## 🛠️ Usage Examples

### Scraping Google Places API

```typescript
import { puppeteerUtils } from '@/lib/puppeteer-utils';

// Scrape restaurants from Google Places
const restaurants = await puppeteerUtils.scrapeGooglePlaces('restaurants in Katy Texas');
console.log(restaurants);
```

### Scraping Restaurant Websites

```typescript
import { puppeteerUtils } from '@/lib/puppeteer-utils';

// Scrape restaurant website for details
const websiteData = await puppeteerUtils.scrapeRestaurantWebsite('https://restaurant.com');
console.log(websiteData);
```

### Taking Screenshots

```typescript
import { puppeteerUtils } from '@/lib/puppeteer-utils';

// Take screenshot of a website
await puppeteerUtils.takeScreenshot('https://restaurant.com', 'screenshot.png');
```

## 🌐 API Endpoints

### GET /api/scrape/restaurants
Scrape restaurants from Google Places

**Parameters:**
- `q` (string) - Search query (default: "restaurants in Katy Texas")
- `limit` (number) - Maximum results (default: 10)

**Example:**
```bash
curl "http://localhost:3000/api/scrape/restaurants?q=pizza+katy+texas&limit=5"
```

### POST /api/scrape/website
Scrape individual restaurant website

**Body:**
```json
{
  "url": "https://restaurant-website.com"
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/scrape/website" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://restaurant-website.com"}'
```

## 🔄 Fallback Behavior

If Chrome dependencies are not installed, the APIs will:
1. Return mock data for development
2. Include error messages explaining the requirement
3. Provide installation instructions

## 🚦 Integration Points

### eKaty.com Restaurant Directory
- **Google Places Scraping:** Automatically discover new restaurants
- **Website Analysis:** Extract menu, hours, contact info
- **Screenshot Generation:** Create visual previews
- **Responsive Testing:** Verify mobile compatibility

### Admin Panel Features
- Bulk restaurant data import
- Website quality analysis
- Automated content verification
- SEO analysis for restaurant websites

## 🔒 Security Considerations

- Rate limiting implemented to avoid being blocked
- User agent rotation to appear as regular browser
- Respect robots.txt files
- Graceful error handling for failed requests

## 🐛 Troubleshooting

### Common Issues

1. **Chrome dependencies missing:**
   ```bash
   ./setup-puppeteer.sh
   ```

2. **Permission denied:**
   ```bash
   chmod +x setup-puppeteer.sh
   ```

3. **WSL/Docker environments:**
   - Use headless mode: `{ headless: true }`
   - Add `--no-sandbox` flag
   - Consider using Docker with pre-installed Chrome

### Debug Mode

Enable debug logging:
```typescript
const browser = await puppeteerUtils.launchBrowser({ 
  headless: false // Shows browser window
});
```

## 📈 Performance Optimization

- Browser instance reuse for multiple operations
- Page pooling for concurrent scraping
- Screenshot optimization (quality vs file size)
- Memory management with browser cleanup

## 🚀 Production Deployment

### Digital Ocean App Platform
- Install Chrome dependencies in build process
- Use serverless Chrome for better performance
- Configure environment variables for API keys

### Docker Deployment
```dockerfile
# Add to Dockerfile
RUN apt-get update && apt-get install -y \
    libnss3-dev libgconf-2-4 libxss1 libxtst6 \
    libxrandr2 libasound2-dev libpangocairo-1.0-0 \
    libatk1.0-0 libcairo-gobject2 libgtk-3-0 \
    libgdk-pixbuf2.0-0
```

## 📊 Monitoring & Analytics

Track scraping performance:
- Success/failure rates
- Response times
- Data quality metrics
- Rate limiting incidents

---

**Next Steps:**
1. Run `./setup-puppeteer.sh` to install Chrome dependencies
2. Test API endpoints: `/api/scrape/restaurants` and `/api/scrape/website`
3. Integrate scraping into restaurant discovery workflow
4. Add scraping controls to admin panel