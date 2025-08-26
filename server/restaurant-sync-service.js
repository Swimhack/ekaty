import GooglePlacesService from './google-places-service.js';

class RestaurantSyncService {
  constructor(supabaseUrl, supabaseServiceKey, googlePlacesKey) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseServiceKey = supabaseServiceKey;
    this.googlePlaces = new GooglePlacesService(googlePlacesKey);
    
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey
    };
  }

  /**
   * Main synchronization function - pulls from Google Places and updates Supabase
   */
  async syncAllRestaurants() {
    console.log('🔄 Starting restaurant synchronization with Google Places API...');
    
    try {
      // Step 1: Get existing restaurants from database
      const existingRestaurants = await this.getExistingRestaurants();
      console.log(`📊 Found ${existingRestaurants.length} existing restaurants in database`);

      // Step 2: Fetch fresh data from Google Places API
      const googleRestaurants = await this.googlePlaces.getComprehensiveRestaurantDirectory();
      console.log(`🌐 Fetched ${googleRestaurants.length} restaurants from Google Places API`);

      // Step 3: Process updates and new restaurants
      const results = {
        updated: 0,
        created: 0,
        errors: 0,
        unchanged: 0
      };

      // Process restaurants in batches to respect API limits
      const batchSize = 10;
      for (let i = 0; i < googleRestaurants.length; i += batchSize) {
        const batch = googleRestaurants.slice(i, i + batchSize);
        
        for (const googleRestaurant of batch) {
          try {
            await this.processRestaurant(googleRestaurant, existingRestaurants, results);
            // Small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`❌ Error processing restaurant ${googleRestaurant.name}:`, error.message);
            results.errors++;
          }
        }
        
        // Longer delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('✅ Restaurant synchronization completed!');
      console.log(`📈 Results: ${results.created} created, ${results.updated} updated, ${results.unchanged} unchanged, ${results.errors} errors`);
      
      return results;
    } catch (error) {
      console.error('💥 Critical error in restaurant synchronization:', error);
      throw error;
    }
  }

  /**
   * Process individual restaurant - update or create
   */
  async processRestaurant(googleRestaurant, existingRestaurants, results) {
    // Map Google Places data to Supabase schema
    const supabaseData = this.mapGoogleToSupabaseSchema(googleRestaurant);
    
    // Check if restaurant exists (by name and address for now, will use place_id later)
    const existingMatch = this.findExistingRestaurant(googleRestaurant, existingRestaurants);
    
    if (existingMatch) {
      // Update existing restaurant
      const hasChanges = this.hasSignificantChanges(existingMatch, supabaseData);
      
      if (hasChanges) {
        await this.updateRestaurant(existingMatch.id, supabaseData);
        console.log(`✏️  Updated: ${googleRestaurant.name}`);
        results.updated++;
      } else {
        results.unchanged++;
      }
    } else {
      // Create new restaurant
      await this.createRestaurant(supabaseData);
      console.log(`➕ Created: ${googleRestaurant.name}`);
      results.created++;
    }
  }

  /**
   * Map Google Places data structure to Supabase restaurants table schema
   */
  mapGoogleToSupabaseSchema(googleData) {
    return {
      name: googleData.name,
      address: googleData.address,
      cuisine: [googleData.primary_cuisine?.name || 'Restaurant'].filter(Boolean),
      price_range: googleData.price_range || 2,
      rating: googleData.average_rating || 0,
      description: googleData.description || '',
      phone: googleData.phone || null,
      website: googleData.website || null,
      hours: this.formatHoursForSupabase(googleData.hours),
      distance: this.calculateDistanceFromKatyCenter(googleData.latitude, googleData.longitude),
      google_place_id: googleData.google_place_id,
      latitude: googleData.latitude,
      longitude: googleData.longitude,
      total_reviews_count: googleData.total_reviews || 0,
      opening_hours: this.formatOpeningHours(googleData.hours),
      types: this.extractGoogleTypes(googleData),
      last_updated_from_google: new Date().toISOString(),
      image: googleData.cover_image_url || null,
      popular: googleData.total_reviews > 50 && googleData.average_rating > 4.0
    };
  }

  /**
   * Format hours for Supabase JSON structure
   */
  formatHoursForSupabase(hoursString) {
    if (!hoursString || hoursString === 'Hours not available') {
      return null;
    }

    // Default hours structure - will be enhanced if Google provides structured data
    return {
      'Monday': { 'open': '11:00', 'close': '21:00' },
      'Tuesday': { 'open': '11:00', 'close': '21:00' },
      'Wednesday': { 'open': '11:00', 'close': '21:00' },
      'Thursday': { 'open': '11:00', 'close': '21:00' },
      'Friday': { 'open': '11:00', 'close': '22:00' },
      'Saturday': { 'open': '11:00', 'close': '22:00' },
      'Sunday': { 'open': '12:00', 'close': '21:00' }
    };
  }

  /**
   * Format opening hours for the opening_hours field
   */
  formatOpeningHours(hoursString) {
    if (!hoursString || hoursString === 'Hours not available') {
      return null;
    }
    return hoursString;
  }

  /**
   * Extract Google Place types
   */
  extractGoogleTypes(googleData) {
    return ['restaurant', 'food', 'establishment'];
  }

  /**
   * Calculate distance from Katy city center
   */
  calculateDistanceFromKatyCenter(lat, lng) {
    const katyLat = 29.7859;
    const katyLng = -95.8244;
    
    const R = 3959; // Earth's radius in miles
    const dLat = (lat - katyLat) * Math.PI / 180;
    const dLng = (lng - katyLng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(katyLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Find existing restaurant match
   */
  findExistingRestaurant(googleRestaurant, existingRestaurants) {
    // First try to match by google_place_id
    if (googleRestaurant.google_place_id) {
      const placeIdMatch = existingRestaurants.find(r => 
        r.google_place_id === googleRestaurant.google_place_id
      );
      if (placeIdMatch) return placeIdMatch;
    }

    // Fallback to fuzzy name and address matching
    return existingRestaurants.find(existing => {
      const nameSimilarity = this.calculateSimilarity(
        existing.name.toLowerCase(),
        googleRestaurant.name.toLowerCase()
      );
      
      const addressSimilarity = this.calculateSimilarity(
        existing.address?.toLowerCase() || '',
        googleRestaurant.address?.toLowerCase() || ''
      );
      
      return nameSimilarity > 0.8 && addressSimilarity > 0.6;
    });
  }

  /**
   * Calculate string similarity (simple implementation)
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  /**
   * Check if restaurant data has significant changes worth updating
   */
  hasSignificantChanges(existing, newData) {
    const significantFields = [
      'rating', 'total_reviews_count', 'phone', 'website', 
      'hours', 'address', 'price_range'
    ];
    
    for (const field of significantFields) {
      if (existing[field] !== newData[field]) {
        // Special handling for rating changes (only update if difference > 0.1)
        if (field === 'rating') {
          const ratingDiff = Math.abs((existing[field] || 0) - (newData[field] || 0));
          if (ratingDiff > 0.1) return true;
        } else {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Get all existing restaurants from Supabase
   */
  async getExistingRestaurants() {
    const response = await fetch(
      `${this.supabaseUrl}/rest/v1/restaurants?select=*`,
      { headers: this.headers }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch existing restaurants: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Create new restaurant in Supabase
   */
  async createRestaurant(restaurantData) {
    const response = await fetch(
      `${this.supabaseUrl}/rest/v1/restaurants`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(restaurantData)
      }
    );
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to create restaurant: ${response.statusText} - ${errorData}`);
    }
  }

  /**
   * Update existing restaurant in Supabase
   */
  async updateRestaurant(id, restaurantData) {
    const response = await fetch(
      `${this.supabaseUrl}/rest/v1/restaurants?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(restaurantData)
      }
    );
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to update restaurant: ${response.statusText} - ${errorData}`);
    }
  }
}

export default RestaurantSyncService;