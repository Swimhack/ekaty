import pkg from '@googlemaps/places';
const { PlacesApi } = pkg;

// Google Places API service for fetching real restaurant data in Katy, Texas
class GooglePlacesService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.placesApi = new PlacesApi({
      apiKey: apiKey
    });
    
    // Katy, Texas coordinates and search area
    this.katyBounds = {
      center: { lat: 29.7859, lng: -95.8244 }, // Katy, TX center
      radius: 15000 // 15km radius to cover greater Katy area
    };
  }

  /**
   * Search for restaurants in Katy, Texas area
   * @param {string} cuisineType - Optional cuisine filter
   * @param {number} maxResults - Maximum number of results (default: 50)
   * @returns {Promise<Array>} Array of restaurant objects
   */
  async searchRestaurants(cuisineType = '', maxResults = 50) {
    try {
      let query = 'restaurant Katy Texas';
      if (cuisineType) {
        query = `${cuisineType} restaurant Katy Texas`;
      }

      const request = {
        textQuery: query,
        locationBias: {
          circle: {
            center: this.katyBounds.center,
            radius: this.katyBounds.radius
          }
        },
        maxResultCount: Math.min(maxResults, 20), // API limit per request
        languageCode: 'en',
        fieldMask: {
          paths: [
            'places.displayName',
            'places.formattedAddress', 
            'places.location',
            'places.rating',
            'places.userRatingCount',
            'places.priceLevel',
            'places.types',
            'places.websiteUri',
            'places.nationalPhoneNumber',
            'places.businessStatus',
            'places.photos',
            'places.editorialSummary',
            'places.regularOpeningHours',
            'places.servesBreakfast',
            'places.servesLunch', 
            'places.servesDinner',
            'places.servesBeer',
            'places.servesWine',
            'places.takeout',
            'places.delivery',
            'places.dineIn',
            'places.reservable',
            'places.goodForChildren',
            'places.restroom',
            'places.parkingOptions'
          ]
        }
      };

      const response = await this.placesApi.searchText(request);
      
      if (!response.data.places) {
        return [];
      }

      return response.data.places.map((place, index) => this.formatRestaurant(place, index + 1));
    } catch (error) {
      console.error('Error fetching restaurants from Google Places:', error);
      throw error;
    }
  }

  /**
   * Get restaurants by specific cuisines for comprehensive directory
   */
  async getComprehensiveRestaurantDirectory() {
    const cuisineTypes = [
      'Italian',
      'Mexican', 
      'Chinese',
      'Thai',
      'Indian',
      'Japanese',
      'BBQ',
      'Seafood',
      'American',
      'Pizza',
      'Steakhouse',
      'Mediterranean',
      'Vietnamese',
      'Korean',
      'Tex-Mex',
      'Cajun',
      'Soul Food',
      'Burger',
      'Breakfast',
      'Cafe'
    ];

    const allRestaurants = new Map(); // Use Map to avoid duplicates by place_id
    
    try {
      // Fetch general restaurants first
      const generalResults = await this.searchRestaurants('', 20);
      generalResults.forEach(restaurant => {
        if (!allRestaurants.has(restaurant.google_place_id)) {
          allRestaurants.set(restaurant.google_place_id, restaurant);
        }
      });

      // Then fetch by specific cuisines
      for (const cuisine of cuisineTypes) {
        try {
          await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
          const cuisineResults = await this.searchRestaurants(cuisine, 10);
          
          cuisineResults.forEach(restaurant => {
            if (!allRestaurants.has(restaurant.google_place_id)) {
              // Update primary cuisine if not already set appropriately
              if (!restaurant.primary_cuisine.name || restaurant.primary_cuisine.name === 'Restaurant') {
                restaurant.primary_cuisine.name = cuisine;
              }
              allRestaurants.set(restaurant.google_place_id, restaurant);
            }
          });
        } catch (error) {
          console.warn(`Error fetching ${cuisine} restaurants:`, error.message);
          continue; // Continue with next cuisine
        }
      }

      const finalResults = Array.from(allRestaurants.values());
      console.log(`✅ Fetched ${finalResults.length} unique restaurants from Google Places API`);
      
      return finalResults;
    } catch (error) {
      console.error('Error building comprehensive restaurant directory:', error);
      throw error;
    }
  }

  /**
   * Format Google Places result to our restaurant object structure
   */
  formatRestaurant(place, id) {
    const name = place.displayName?.text || 'Unknown Restaurant';
    const address = place.formattedAddress || '';
    const phone = place.nationalPhoneNumber || '';
    const website = place.websiteUri || '';
    const rating = place.rating || 0;
    const reviewCount = place.userRatingCount || 0;
    
    // Extract price range (Google uses PRICE_LEVEL_UNSPECIFIED, PRICE_LEVEL_FREE, etc.)
    let priceRange = 2; // Default to $$
    if (place.priceLevel) {
      switch(place.priceLevel) {
        case 'PRICE_LEVEL_INEXPENSIVE': priceRange = 1; break;
        case 'PRICE_LEVEL_MODERATE': priceRange = 2; break;
        case 'PRICE_LEVEL_EXPENSIVE': priceRange = 3; break;
        case 'PRICE_LEVEL_VERY_EXPENSIVE': priceRange = 4; break;
        default: priceRange = 2;
      }
    }

    // Determine cuisine from place types
    const cuisine = this.determineCuisineFromTypes(place.types || []);
    
    // Extract area from address
    const area = this.extractAreaFromAddress(address);
    
    // Get photo URL if available
    const photoUrl = this.getPhotoUrl(place.photos);
    
    // Generate description from editorial summary or create one
    const description = place.editorialSummary?.text || 
      `${cuisine} restaurant located in ${area}, Katy serving delicious food with ${rating} star rating.`;

    // Extract hours
    const hours = this.formatHours(place.regularOpeningHours);

    return {
      id: id,
      google_place_id: place.id || `place_${id}`,
      name: name,
      description: description,
      address: address,
      phone: phone,
      email: '', // Not available from Places API
      website: website,
      average_rating: parseFloat(rating.toFixed(1)),
      total_reviews: reviewCount,
      price_range: priceRange,
      year_opened: null, // Not available from Places API
      hours: hours,
      menu_url: website, // Use website as menu fallback
      logo_url: photoUrl,
      cover_image_url: photoUrl,
      slug: this.createSlug(name),
      primary_cuisine: { name: cuisine },
      secondary_cuisine: null,
      tertiary_cuisine: null,
      area: { name: area },
      delivery_available: place.delivery || false,
      takeout_available: place.takeout || false,
      kid_friendly: place.goodForChildren || false,
      wifi_available: false, // Not available from Places API
      reservable: place.reservable || false,
      serves_breakfast: place.servesBreakfast || false,
      serves_lunch: place.servesLunch || false,
      serves_dinner: place.servesDinner || false,
      serves_beer: place.servesBeer || false,
      serves_wine: place.servesWine || false,
      dine_in: place.dineIn !== false, // Default to true unless explicitly false
      parking_available: !!(place.parkingOptions?.freeParkingLot || place.parkingOptions?.paidParkingLot),
      latitude: place.location?.latitude || 29.7859,
      longitude: place.location?.longitude || -95.8244
    };
  }

  /**
   * Determine cuisine type from Google Place types
   */
  determineCuisineFromTypes(types) {
    const cuisineMap = {
      'chinese_restaurant': 'Chinese',
      'italian_restaurant': 'Italian', 
      'mexican_restaurant': 'Mexican',
      'thai_restaurant': 'Thai',
      'indian_restaurant': 'Indian',
      'japanese_restaurant': 'Japanese',
      'korean_restaurant': 'Korean',
      'vietnamese_restaurant': 'Vietnamese',
      'mediterranean_restaurant': 'Mediterranean',
      'american_restaurant': 'American',
      'seafood_restaurant': 'Seafood',
      'steak_house': 'Steakhouse',
      'pizza_restaurant': 'Pizza',
      'sandwich_shop': 'American',
      'hamburger_restaurant': 'Burger',
      'breakfast_restaurant': 'Breakfast',
      'bakery': 'Bakery',
      'cafe': 'Cafe',
      'fast_food_restaurant': 'Fast Food',
      'barbecue_restaurant': 'BBQ'
    };

    for (const type of types) {
      if (cuisineMap[type]) {
        return cuisineMap[type];
      }
    }

    // Check for cuisine keywords in place types
    const typeString = types.join(' ').toLowerCase();
    if (typeString.includes('pizza')) return 'Pizza';
    if (typeString.includes('bbq') || typeString.includes('barbecue')) return 'BBQ';
    if (typeString.includes('burger')) return 'Burger';
    if (typeString.includes('seafood')) return 'Seafood';
    if (typeString.includes('steak')) return 'Steakhouse';
    
    return 'Restaurant'; // Default fallback
  }

  /**
   * Extract area/neighborhood from address
   */
  extractAreaFromAddress(address) {
    // Common Katy area neighborhoods and landmarks
    const katyAreas = [
      'Cinco Ranch', 'Mason Creek', 'Cross Creek Ranch', 'Falcon Landing',
      'Katy Mills', 'Old Katy', 'West Katy', 'East Katy', 'Nottingham Country',
      'Pin Oak', 'Kelliwood', 'Greatwood', 'New Territory', 'Westfield'
    ];

    const upperAddress = address.toUpperCase();
    
    for (const area of katyAreas) {
      if (upperAddress.includes(area.toUpperCase())) {
        return area;
      }
    }

    // Check for major roads/areas
    if (upperAddress.includes('CINCO RANCH')) return 'Cinco Ranch';
    if (upperAddress.includes('MASON ROAD') || upperAddress.includes('MASON RD')) return 'Mason Creek';
    if (upperAddress.includes('PIN OAK')) return 'Pin Oak';
    if (upperAddress.includes('CLAY ROAD') || upperAddress.includes('CLAY RD')) return 'West Katy';
    if (upperAddress.includes('KATY MILLS')) return 'Katy Mills';
    
    return 'Katy'; // Default fallback
  }

  /**
   * Get photo URL from Google Places photos
   */
  getPhotoUrl(photos) {
    if (!photos || photos.length === 0) {
      return `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&crop=center`;
    }

    // Use the first photo with proper sizing
    const photo = photos[0];
    if (photo.name) {
      return `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=400&maxHeightPx=250&key=${this.apiKey}`;
    }

    return `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&crop=center`;
  }

  /**
   * Format opening hours
   */
  formatHours(openingHours) {
    if (!openingHours?.weekdayDescriptions) {
      return 'Hours not available';
    }

    return openingHours.weekdayDescriptions.join(', ');
  }

  /**
   * Create URL-friendly slug from restaurant name
   */
  createSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}

export default GooglePlacesService;