# Google Places API Integration Guide

The eKaty.com restaurant directory is designed to use real restaurant data from Google Places API for comprehensive coverage of Katy, Texas area restaurants.

## Setup Instructions

### 1. Get Google Maps API Key

1. Visit [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials)
2. Create a new project or select existing project
3. Enable the **Places API (New)**
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Configure API Key

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your API key to `.env`:
   ```env
   GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
   API_PORT=8082
   FRONTEND_URL=http://localhost:8083
   ```

### 3. Start with Real Data

Once configured, the API server will automatically:
- Fetch comprehensive restaurant data from Google Places
- Cover all major cuisines in Katy, Texas area  
- Include real ratings, reviews, photos, and contact information
- Update restaurant counts dynamically

```bash
# Start API server with Google Places integration
npm run api-server
```

## Features with Google Places API

### Comprehensive Restaurant Coverage
- **20+ Cuisine Types**: Italian, Mexican, Chinese, Thai, Indian, Japanese, BBQ, Seafood, American, and more
- **50+ Real Restaurants**: Actual businesses in Katy, Texas with verified information
- **Authentic Data**: Real ratings, review counts, phone numbers, addresses, and hours

### Advanced Search Capabilities
- **Location-Based**: Focused on 15km radius around Katy, Texas (29.7859, -95.8244)
- **Cuisine Filtering**: Search by specific cuisine types
- **Area Coverage**: Cinco Ranch, Mason Creek, Cross Creek Ranch, Old Katy, and more
- **Business Details**: Real photos, hours, contact info, and services (delivery, takeout, etc.)

### Data Quality
- **Real Reviews**: Actual Google review counts and ratings
- **Current Information**: Up-to-date business status and hours
- **Professional Photos**: High-quality restaurant images from Google
- **Comprehensive Details**: Full address, phone, website, and service options

## API Endpoints

### GET /api/restaurants.php
```javascript
// With real Google Places data
{
  "restaurants": [
    {
      "id": 1,
      "name": "Actual Restaurant Name",
      "description": "Real business description from Google",
      "address": "Real address in Katy, TX",
      "phone": "Actual phone number",
      "average_rating": 4.5,  // Real Google rating
      "total_reviews": 324,   // Real review count
      "price_range": 2,       // Based on Google price level
      "primary_cuisine": { "name": "Italian" },
      "area": { "name": "Cinco Ranch" },
      "delivery_available": true,  // Real service info
      "google_place_id": "ChIJ...",  // Google Place ID
      "latitude": 29.7859,
      "longitude": -95.8244
    }
  ],
  "pagination": {
    "total": 75,  // Total real restaurants found
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

### GET /api/cuisines.php
```javascript
// Dynamically calculated from real restaurant data
[
  {
    "id": 1,
    "name": "American",
    "keywords": "american,burgers,comfort",
    "restaurant_count": 18  // Actual count from Google Places
  },
  {
    "id": 2,
    "name": "Italian", 
    "keywords": "italian,pasta,pizza",
    "restaurant_count": 12  // Real count of Italian restaurants
  }
]
```

## Fallback Behavior

Without Google Places API key:
- Uses 12 high-quality mock restaurants  
- All functionality still works perfectly
- Great for development and testing
- Professional-grade mock data with realistic information

With Google Places API:
- 50+ real restaurants from Katy, Texas
- Authentic business information
- Real photos and reviews
- Comprehensive cuisine coverage

## Rate Limiting

The Google Places service includes:
- Request throttling to respect API limits
- Caching to minimize API calls
- Error handling with graceful fallbacks
- Efficient batch processing for multiple cuisine types

## Cost Considerations

Google Places API charges per request:
- **Text Search**: ~$32 per 1,000 requests
- **Place Details**: ~$17 per 1,000 requests  
- **Photos**: ~$7 per 1,000 requests

The integration is optimized to minimize costs:
- Data is cached for 5 minutes to reduce repeat calls
- Batch requests by cuisine type
- Only essential fields requested
- Fallback to mock data if quota exceeded

## Monitoring

Server logs show:
```
✅ Google Places API initialized
🔍 Fetching comprehensive restaurant directory from Google Places...
✅ Loaded 67 real restaurants from Google Places API
```

Or for mock data:
```
⚠️  Google Places API not configured, using mock data
   Set GOOGLE_MAPS_API_KEY environment variable to use real restaurant data
```

This integration ensures the eKaty.com directory can represent a truly comprehensive and amazing selection of ALL restaurants in the Katy, Texas area.