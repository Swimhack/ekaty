# Restaurant Data Synchronization System

## Overview
This system automatically synchronizes restaurant data from Google Places API to keep your Supabase database updated with current information including ratings, hours, contact details, and new restaurants.

## System Components

### 1. Google Places Service (`server/google-places-service.js`)
- Handles all Google Places API interactions
- Fetches comprehensive restaurant data for Katy, TX area
- Formats data for database storage
- Implements rate limiting and error handling

### 2. Restaurant Sync Service (`server/restaurant-sync-service.js`)
- Maps Google Places data to Supabase schema
- Handles restaurant matching and deduplication
- Updates existing restaurants and creates new ones
- Tracks sync metrics and errors

### 3. Manual Sync Script (`server/sync-restaurants.js`)
- Command-line tool for manual synchronization
- Comprehensive logging and error reporting
- Environment variable validation
- Progress tracking and statistics

### 4. Automated Edge Function (`supabase/functions/sync-restaurants/index.ts`)
- Serverless function for scheduled execution
- Webhook-compatible for external triggers
- Activity logging and monitoring
- Error handling and recovery

### 5. Test Suite (`server/test-sync.js`)
- Validates Google Places API connectivity
- Tests Supabase database connection
- Verifies data mapping functions
- Dry run testing without database writes

## Setup Instructions

### Prerequisites
1. **Google Places API Key**: Enable Places API in Google Cloud Console
2. **Supabase Project**: Service role key with database access
3. **Environment Variables**: Configured in `.env.local`

### Required Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_PLACES_API_KEY=your-google-places-key
```

### Installation
```bash
# Install dependencies
npm install dotenv

# Make scripts executable
chmod +x server/sync-restaurants.js
chmod +x server/test-sync.js
```

## Usage

### 1. Testing the System
Before running synchronization, validate all components:

```bash
# Run comprehensive test suite
node server/test-sync.js
```

The test suite will verify:
- ✅ Google Places API connectivity
- ✅ Supabase database access  
- ✅ Data mapping functions
- ✅ Dry run synchronization

### 2. Manual Synchronization
Run complete restaurant synchronization:

```bash
# Full synchronization
node server/sync-restaurants.js
```

Expected output:
```
🚀 Restaurant Synchronization Script Starting...
📊 Found 61 existing restaurants in database
🌐 Fetched 150 restaurants from Google Places API
✏️  Updated: Adriatic Cafe Italian Grill
➕ Created: New Katy Bistro
✅ Sync completed: 15 created, 8 updated, 0 errors
```

### 3. Automated Daily Sync

#### Option A: Server Cron Job
Add to crontab for daily execution at 2 AM:
```bash
# Edit crontab
crontab -e

# Add line for daily sync at 2 AM
0 2 * * * cd /path/to/ekaty.com && node server/sync-restaurants.js >> logs/cron.log 2>&1
```

#### Option B: Supabase Edge Function
Deploy the edge function for serverless execution:

```bash
# Deploy edge function
supabase functions deploy sync-restaurants

# Set up environment variables
supabase secrets set GOOGLE_PLACES_API_KEY=your-key

# Schedule with external cron service or webhook
```

## Data Mapping

### Google Places → Supabase Schema
| Google Places Field | Supabase Field | Notes |
|---------------------|----------------|-------|
| `displayName.text` | `name` | Restaurant name |
| `formattedAddress` | `address` | Full address |
| `rating` | `rating` | Average rating |
| `userRatingCount` | `total_reviews_count` | Review count |
| `priceLevel` | `price_range` | 1-4 scale |
| `place_id` | `google_place_id` | Unique identifier |
| `location` | `latitude`, `longitude` | GPS coordinates |
| `types` | `cuisine` | Mapped to cuisine types |
| `regularOpeningHours` | `hours`, `opening_hours` | Business hours |

### Cuisine Type Mapping
- `italian_restaurant` → Italian
- `mexican_restaurant` → Mexican  
- `chinese_restaurant` → Chinese
- `american_restaurant` → American
- `pizza_restaurant` → Pizza
- And more...

## Monitoring & Logging

### Log Files
- `logs/restaurant-sync.log`: Detailed sync results
- `logs/cron.log`: Cron job execution logs

### Activity Logging
All sync operations are logged to the `activity_logs` table:
```sql
SELECT * FROM activity_logs 
WHERE action = 'restaurant_sync' 
ORDER BY created_at DESC;
```

### Sync Metrics
Each sync operation tracks:
- **Created**: New restaurants added
- **Updated**: Existing restaurants modified  
- **Unchanged**: Restaurants with no changes
- **Errors**: Failed operations
- **Duration**: Total execution time

## Error Handling

### Common Issues & Solutions

#### 1. Google Places API Errors
```
❌ Error: REQUEST_DENIED
```
**Solutions:**
- Enable Places API in Google Cloud Console
- Check API key restrictions
- Verify billing is enabled
- Ensure quota limits not exceeded

#### 2. Supabase Connection Errors
```
❌ Error: Failed to fetch existing restaurants
```
**Solutions:**
- Verify service role key is correct
- Check network connectivity
- Ensure database is accessible

#### 3. Rate Limit Issues
```
❌ Error: OVER_QUERY_LIMIT
```
**Solutions:**
- Implemented automatic delays between requests
- Batch processing with 500ms delays
- Reduce batch sizes if needed

### Retry Logic
- Failed restaurant updates are logged but don't stop the process
- Network errors trigger automatic retries with exponential backoff
- Critical errors are logged with full stack traces

## Performance Optimization

### Rate Limiting
- 100ms delay between individual restaurant requests
- 500ms delay between batches of 10 restaurants
- Respects Google Places API quota limits

### Database Optimization  
- Bulk operations where possible
- Efficient matching algorithms
- Selective updates (only changed data)

### Memory Management
- Processes restaurants in batches
- Streams data to avoid memory overload
- Garbage collection friendly

## Maintenance

### Weekly Tasks
- Review sync logs for errors
- Monitor Google Places API usage
- Check database performance

### Monthly Tasks  
- Audit restaurant data quality
- Review and update cuisine mappings
- Optimize sync performance

### Quarterly Tasks
- Update Google Places API field mappings
- Review and expand search coverage
- Performance benchmarking

## Troubleshooting

### Debug Mode
Enable detailed logging:
```bash
DEBUG=true node server/sync-restaurants.js
```

### Manual Restaurant Check
Test individual restaurant processing:
```bash
# Check specific restaurant by name
node -e "
import GooglePlacesService from './server/google-places-service.js';
const service = new GooglePlacesService(process.env.GOOGLE_PLACES_API_KEY);
const results = await service.searchRestaurants('Adriatic Cafe', 1);
console.log(JSON.stringify(results[0], null, 2));
"
```

### Database Verification
Check sync results in database:
```sql
-- Recent updates
SELECT name, last_updated_from_google, google_place_id 
FROM restaurants 
WHERE last_updated_from_google > NOW() - INTERVAL '1 day'
ORDER BY last_updated_from_google DESC;

-- Missing Google data
SELECT name, google_place_id IS NULL as missing_place_id
FROM restaurants 
WHERE google_place_id IS NULL;
```

## Security Considerations

- API keys stored in environment variables only
- Service role key has minimal required permissions
- All API requests use HTTPS
- Error logs don't expose sensitive data
- Rate limiting prevents API abuse

## Future Enhancements

1. **Enhanced Matching**: ML-based restaurant matching
2. **Real-time Updates**: Webhook-based immediate updates
3. **Photo Sync**: Automatic image updating
4. **Menu Integration**: OCR menu processing
5. **Review Analysis**: Sentiment analysis integration
6. **Performance Metrics**: Advanced monitoring dashboard

---

## Quick Start Checklist

- [ ] Enable Google Places API in Google Cloud Console
- [ ] Configure environment variables in `.env.local`
- [ ] Install dependencies: `npm install dotenv`
- [ ] Run test suite: `node server/test-sync.js`
- [ ] Execute manual sync: `node server/sync-restaurants.js`
- [ ] Set up daily cron job
- [ ] Monitor logs and performance

## Support

For issues or questions about the restaurant synchronization system:
1. Check the logs in `logs/restaurant-sync.log`
2. Run the test suite to diagnose problems
3. Review Google Places API quotas and limits
4. Verify Supabase database connectivity