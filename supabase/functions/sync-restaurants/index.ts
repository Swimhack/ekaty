import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Supabase Edge Function for scheduled restaurant data synchronization
 * This function can be triggered by cron jobs or webhooks to automatically
 * sync restaurant data from Google Places API daily
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googlePlacesKey = Deno.env.get('GOOGLE_PLACES_API_KEY')!;

    if (!supabaseUrl || !supabaseServiceKey || !googlePlacesKey) {
      throw new Error('Missing required environment variables');
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 Starting restaurant synchronization...');
    
    // Get existing restaurants from database
    const { data: existingRestaurants, error: fetchError } = await supabase
      .from('restaurants')
      .select('*');
    
    if (fetchError) {
      throw new Error(`Failed to fetch existing restaurants: ${fetchError.message}`);
    }

    console.log(`📊 Found ${existingRestaurants?.length || 0} existing restaurants`);

    // Fetch restaurants from Google Places API
    const googleRestaurants = await fetchGooglePlacesData(googlePlacesKey);
    console.log(`🌐 Fetched ${googleRestaurants.length} restaurants from Google Places`);

    // Process synchronization
    const results = {
      updated: 0,
      created: 0,
      errors: 0,
      unchanged: 0
    };

    // Process restaurants in batches
    const batchSize = 5;
    for (let i = 0; i < googleRestaurants.length; i += batchSize) {
      const batch = googleRestaurants.slice(i, i + batchSize);
      
      for (const restaurant of batch) {
        try {
          await processRestaurant(restaurant, existingRestaurants || [], supabase, results);
          
          // Small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`❌ Error processing ${restaurant.name}:`, error.message);
          results.errors++;
        }
      }
      
      // Delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Log sync results
    await logSyncResults(supabase, results);

    console.log(`✅ Sync completed: ${results.created} created, ${results.updated} updated, ${results.errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        message: `Synchronization completed successfully`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('💥 Error in sync function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Fetch restaurant data from Google Places API
 */
async function fetchGooglePlacesData(apiKey: string) {
  const restaurants = [];
  
  // Search for restaurants in Katy, TX
  const query = 'restaurant Katy Texas';
  const location = '29.7859,-95.8244'; // Katy, TX coordinates
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${location}&radius=15000&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Places API status: ${data.status}`);
    }
    
    for (const place of data.results) {
      restaurants.push(formatGooglePlaceData(place, apiKey));
    }
    
  } catch (error) {
    console.error('Error fetching from Google Places API:', error);
    throw error;
  }
  
  return restaurants;
}

/**
 * Format Google Places data to our schema
 */
function formatGooglePlaceData(place: any, apiKey: string) {
  return {
    name: place.name,
    address: place.formatted_address,
    cuisine: extractCuisineFromTypes(place.types),
    price_range: place.price_level || 2,
    rating: place.rating || 0,
    description: `${place.name} is a restaurant located in Katy, Texas.`,
    phone: null, // Would need Place Details API for this
    website: null, // Would need Place Details API for this
    hours: null, // Would need Place Details API for this
    distance: 0, // Calculate from Katy center
    google_place_id: place.place_id,
    latitude: place.geometry?.location?.lat,
    longitude: place.geometry?.location?.lng,
    total_reviews_count: place.user_ratings_total || 0,
    opening_hours: place.opening_hours?.weekday_text?.join(', ') || null,
    types: place.types,
    last_updated_from_google: new Date().toISOString(),
    image: getPhotoUrl(place.photos, apiKey),
    popular: (place.user_ratings_total || 0) > 50 && (place.rating || 0) > 4.0
  };
}

/**
 * Extract cuisine from Google Place types
 */
function extractCuisineFromTypes(types: string[]) {
  const cuisineMap: { [key: string]: string } = {
    'chinese_restaurant': 'Chinese',
    'italian_restaurant': 'Italian',
    'mexican_restaurant': 'Mexican',
    'thai_restaurant': 'Thai',
    'japanese_restaurant': 'Japanese',
    'indian_restaurant': 'Indian',
    'american_restaurant': 'American',
    'pizza_restaurant': 'Pizza',
    'seafood_restaurant': 'Seafood'
  };
  
  for (const type of types) {
    if (cuisineMap[type]) {
      return [cuisineMap[type]];
    }
  }
  
  return ['Restaurant'];
}

/**
 * Get photo URL from Google Places photos
 */
function getPhotoUrl(photos: any[], apiKey: string) {
  if (!photos || photos.length === 0) {
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop';
  }
  
  const photoReference = photos[0].photo_reference;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;
}

/**
 * Process individual restaurant - update or create
 */
async function processRestaurant(restaurant: any, existing: any[], supabase: any, results: any) {
  const match = findExistingRestaurant(restaurant, existing);
  
  if (match) {
    // Update existing restaurant
    const { error } = await supabase
      .from('restaurants')
      .update({
        rating: restaurant.rating,
        total_reviews_count: restaurant.total_reviews_count,
        google_place_id: restaurant.google_place_id,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        last_updated_from_google: restaurant.last_updated_from_google,
        types: restaurant.types,
        opening_hours: restaurant.opening_hours
      })
      .eq('id', match.id);
      
    if (error) {
      throw new Error(`Update failed: ${error.message}`);
    }
    
    results.updated++;
  } else {
    // Create new restaurant
    const { error } = await supabase
      .from('restaurants')
      .insert([restaurant]);
      
    if (error) {
      throw new Error(`Insert failed: ${error.message}`);
    }
    
    results.created++;
  }
}

/**
 * Find existing restaurant by name similarity
 */
function findExistingRestaurant(googleRestaurant: any, existing: any[]) {
  return existing.find(r => 
    r.google_place_id === googleRestaurant.google_place_id ||
    (r.name.toLowerCase().includes(googleRestaurant.name.toLowerCase().substring(0, 10)) &&
     r.address?.toLowerCase().includes('katy'))
  );
}

/**
 * Log synchronization results
 */
async function logSyncResults(supabase: any, results: any) {
  try {
    await supabase
      .from('activity_logs')
      .insert([{
        user_id: null,
        action: 'restaurant_sync',
        resource_type: 'restaurants',
        resource_id: null,
        details: {
          sync_results: results,
          timestamp: new Date().toISOString()
        },
        ip_address: null,
        user_agent: 'Supabase Edge Function'
      }]);
  } catch (error) {
    console.warn('Failed to log sync results:', error);
  }
}