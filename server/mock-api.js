import express from 'express';
import cors from 'cors';
import path from 'path';
import GooglePlacesService from './google-places-service.js';

const app = express();
const PORT = 8082;

// Initialize Google Places service if API key is available
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
let googlePlacesService = null;
let realRestaurants = [];

if (GOOGLE_API_KEY && GOOGLE_API_KEY !== 'your_google_maps_api_key_here') {
  googlePlacesService = new GooglePlacesService(GOOGLE_API_KEY);
  console.log('✅ Google Places API initialized');
  
  // Fetch real restaurant data on startup
  (async () => {
    try {
      console.log('🔍 Fetching comprehensive restaurant directory from Google Places...');
      realRestaurants = await googlePlacesService.getComprehensiveRestaurantDirectory();
      console.log(`✅ Loaded ${realRestaurants.length} real restaurants from Google Places API`);
    } catch (error) {
      console.error('❌ Error loading real restaurants, using mock data:', error.message);
      realRestaurants = [];
    }
  })();
} else {
  console.log('⚠️  Google Places API not configured, using mock data');
  console.log('   Set GOOGLE_MAPS_API_KEY environment variable to use real restaurant data');
}

// Enable CORS
app.use(cors({
  origin: 'http://localhost:8081',
  credentials: true
}));

app.use(express.json());

// Mock restaurant data based on the actual database structure
const mockRestaurants = [
  {
    id: 1,
    name: "Grazia Italian Kitchen",
    description: "Authentic Italian cuisine with a modern twist. Fresh pasta made daily and wood-fired pizzas.",
    address: "23501 Cinco Ranch Blvd, Katy, TX 77494",
    phone: "(281) 347-7070",
    email: "info@graziaitalian.com",
    website: "https://graziaitalian.com",
    average_rating: 4.6,
    total_reviews: 89,
    price_range: 3,
    year_opened: 2018,
    hours: "Mon-Thu: 11am-9pm, Fri-Sat: 11am-10pm, Sun: 11am-8pm",
    menu_url: "https://graziaitalian.com/menu",
    logo_url: "https://images.unsplash.com/photo-1594736797933-d0a9159d2d31?w=100&h=100&fit=crop&crop=center",
    cover_image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop&crop=center",
    slug: "grazia-italian-kitchen",
    primary_cuisine: { name: "Italian" },
    secondary_cuisine: { name: "Pizza" },
    tertiary_cuisine: null,
    area: { name: "Cinco Ranch" },
    delivery_available: true,
    takeout_available: true,
    kid_friendly: true,
    wifi_available: true
  },
  {
    id: 2,
    name: "The Rouxpour",
    description: "Upscale Cajun and Creole cuisine featuring fresh Gulf seafood and traditional Louisiana favorites.",
    address: "23119 Colonial Pkwy, Katy, TX 77449",
    phone: "(281) 717-4499",
    email: "info@therouxpour.com",
    website: "https://therouxpour.com",
    average_rating: 4.7,
    total_reviews: 156,
    price_range: 4,
    year_opened: 2016,
    hours: "Mon-Thu: 11am-9pm, Fri-Sat: 11am-10pm, Sun: 10am-8pm",
    menu_url: "https://therouxpour.com/menu",
    logo_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop&crop=center",
    cover_image_url: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=250&fit=crop&crop=center",
    slug: "the-rouxpour",
    primary_cuisine: { name: "Cajun" },
    secondary_cuisine: { name: "Seafood" },
    tertiary_cuisine: null,
    area: { name: "Katy" },
    delivery_available: true,
    takeout_available: true,
    kid_friendly: true,
    wifi_available: true
  },
  {
    id: 3,
    name: "Local Foods",
    description: "Farm-to-table restaurant featuring locally sourced ingredients and healthy, fresh options.",
    address: "4410 W Grand Pkwy S, Katy, TX 77494",
    phone: "(281) 492-3663",
    email: "katy@local-foods.com",
    website: "https://local-foods.com",
    average_rating: 4.4,
    total_reviews: 203,
    price_range: 2,
    year_opened: 2019,
    hours: "Daily: 7am-9pm",
    menu_url: "https://local-foods.com/menu",
    logo_url: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=100&h=100&fit=crop&crop=center",
    cover_image_url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=250&fit=crop&crop=center",
    slug: "local-foods",
    primary_cuisine: { name: "American" },
    secondary_cuisine: { name: "Healthy" },
    tertiary_cuisine: null,
    area: { name: "Katy" },
    delivery_available: true,
    takeout_available: true,
    kid_friendly: true,
    wifi_available: true
  },
  {
    id: 4,
    name: "Sushi Hana",
    description: "Fresh sushi and Japanese cuisine in a modern, elegant atmosphere.",
    address: "22756 Westheimer Pkwy, Katy, TX 77450",
    phone: "(281) 392-8888",
    email: "info@sushihana.com",
    website: "https://sushihana.com",
    average_rating: 4.5,
    total_reviews: 127,
    price_range: 3,
    year_opened: 2020,
    hours: "Mon-Thu: 11am-9:30pm, Fri-Sat: 11am-10:30pm, Sun: 12pm-9pm",
    menu_url: "https://sushihana.com/menu",
    logo_url: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=100&h=100&fit=crop&crop=center",
    cover_image_url: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=250&fit=crop&crop=center",
    slug: "sushi-hana",
    primary_cuisine: { name: "Japanese" },
    secondary_cuisine: { name: "Sushi" },
    tertiary_cuisine: null,
    area: { name: "Katy" },
    delivery_available: true,
    takeout_available: true,
    kid_friendly: false,
    wifi_available: true
  },
  {
    id: 5,
    name: "Yama Sushi",
    description: "Traditional Japanese sushi bar with an extensive sake selection and hibachi grill.",
    address: "1302 Pin Oak Rd, Katy, TX 77494",
    phone: "(281) 578-7070",
    email: "contact@yamasushi.com",
    website: "https://yamasushi.com",
    average_rating: 4.3,
    total_reviews: 98,
    price_range: 3,
    year_opened: 2015,
    hours: "Tue-Thu: 5pm-9pm, Fri-Sat: 5pm-10pm, Sun: 5pm-9pm, Mon: Closed",
    menu_url: "https://yamasushi.com/menu",
    logo_url: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=100&h=100&fit=crop&crop=center",
    cover_image_url: "https://images.unsplash.com/photo-1562158079-136a5b7e4da0?w=400&h=250&fit=crop&crop=center",
    slug: "yama-sushi",
    primary_cuisine: { name: "Japanese" },
    secondary_cuisine: { name: "Sushi" },
    tertiary_cuisine: null,
    area: { name: "Katy" },
    delivery_available: false,
    takeout_available: true,
    kid_friendly: true,
    wifi_available: false
  },
  {
    id: 6,
    name: "Snappy's Cafe & Grill",
    description: "Family-friendly American restaurant with comfort food favorites and daily specials.",
    address: "2410 S Mason Rd, Katy, TX 77450",
    phone: "(281) 579-8724",
    email: "info@snappyscafe.com",
    website: "https://snappyscafe.com",
    average_rating: 4.2,
    total_reviews: 234,
    price_range: 2,
    year_opened: 2010,
    hours: "Daily: 6am-9pm",
    menu_url: "https://snappyscafe.com/menu",
    logo_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop&crop=center",
    cover_image_url: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=250&fit=crop&crop=center",
    slug: "snappys-cafe-grill",
    primary_cuisine: { name: "American" },
    secondary_cuisine: { name: "Comfort Food" },
    tertiary_cuisine: null,
    area: { name: "Katy" },
    delivery_available: true,
    takeout_available: true,
    kid_friendly: true,
    wifi_available: true
  },
  {
    id: 7,
    name: "Rudy's Country Store & Bar-B-Q",
    description: "Authentic Texas BBQ featuring slow-smoked brisket, ribs, and sausages with traditional sides.",
    address: "27235 Northwest Fwy, Katy, TX 77494",
    phone: "(281) 693-7839",
    email: "katy@rudys.com",
    website: "https://rudys.com",
    average_rating: 4.5,
    total_reviews: 318,
    price_range: 2,
    year_opened: 2008,
    hours: "Daily: 10:30am-10pm",
    menu_url: "https://rudys.com/menu",
    logo_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=100&h=100&fit=crop&crop=center",
    cover_image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=250&fit=crop&crop=center",
    slug: "rudys-country-store-bbq",
    primary_cuisine: { name: "BBQ" },
    secondary_cuisine: { name: "Texas" },
    tertiary_cuisine: null,
    area: { name: "Katy" },
    delivery_available: true,
    takeout_available: true,
    kid_friendly: true,
    wifi_available: false
  },
  {
    id: 8,
    name: "Los Cucos Mexican Restaurant",
    description: "Traditional Mexican flavors with fresh ingredients, famous for fajitas and margaritas.",
    address: "19025 Clay Rd, Katy, TX 77449",
    phone: "(281) 579-8069",
    email: "katy@loscucos.com",
    website: "https://loscucos.com",
    average_rating: 4.3,
    total_reviews: 412,
    price_range: 2,
    year_opened: 2005,
    hours: "Sun-Thu: 11am-9:30pm, Fri-Sat: 11am-10:30pm",
    menu_url: "https://loscucos.com/menu",
    logo_url: "https://images.unsplash.com/photo-1615870216519-2f9fa2698c7d?w=100&h=100&fit=crop&crop=center",
    cover_image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=250&fit=crop&crop=center",
    slug: "los-cucos-mexican-restaurant",
    primary_cuisine: { name: "Mexican" },
    secondary_cuisine: { name: "Tex-Mex" },
    tertiary_cuisine: null,
    area: { name: "Katy" },
    delivery_available: true,
    takeout_available: true,
    kid_friendly: true,
    wifi_available: true
  },
  {
    id: 9,
    name: "P.F. Chang's",
    description: "Modern Chinese cuisine with fresh ingredients and bold flavors in a stylish atmosphere.",
    address: "23101 Cinco Ranch Blvd, Katy, TX 77494",
    phone: "(281) 347-8800",
    email: "cincoxranch@pfchangs.com",
    website: "https://pfchangs.com",
    average_rating: 4.1,
    total_reviews: 287,
    price_range: 3,
    year_opened: 2012,
    hours: "Mon-Thu: 11am-10pm, Fri-Sat: 11am-11pm, Sun: 11am-9pm",
    menu_url: "https://pfchangs.com/menu",
    logo_url: "https://images.unsplash.com/photo-1563379091339-03246963d999?w=100&h=100&fit=crop&crop=center",
    cover_image_url: "https://images.unsplash.com/photo-1563379091339-03246963d999?w=400&h=250&fit=crop&crop=center",
    slug: "pf-changs",
    primary_cuisine: { name: "Chinese" },
    secondary_cuisine: { name: "Asian" },
    tertiary_cuisine: null,
    area: { name: "Cinco Ranch" },
    delivery_available: true,
    takeout_available: true,
    kid_friendly: true,
    wifi_available: true
  },
  {
    id: 10,
    name: "Thai Gourmet",
    description: "Authentic Thai cuisine with traditional recipes and fresh herbs, from mild to extra spicy.",
    address: "1831 S Mason Rd, Katy, TX 77450",
    phone: "(281) 579-8424",
    email: "info@thaigourmetkaty.com",
    website: "https://thaigourmetkaty.com",
    average_rating: 4.6,
    total_reviews: 189,
    price_range: 2,
    year_opened: 2015,
    hours: "Tue-Sun: 11am-9pm, Mon: Closed",
    menu_url: "https://thaigourmetkaty.com/menu",
    logo_url: "https://images.unsplash.com/photo-1559314809-0f31657def5e?w=100&h=100&fit=crop&crop=center",
    cover_image_url: "https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400&h=250&fit=crop&crop=center",
    slug: "thai-gourmet",
    primary_cuisine: { name: "Thai" },
    secondary_cuisine: { name: "Asian" },
    tertiary_cuisine: null,
    area: { name: "Katy" },
    delivery_available: true,
    takeout_available: true,
    kid_friendly: true,
    wifi_available: true
  },
  {
    id: 11,
    name: "India's Restaurant",
    description: "Traditional Indian cuisine with aromatic spices, tandoor specialties, and vegetarian options.",
    address: "25827 Northwest Fwy, Katy, TX 77494",
    phone: "(281) 392-9200",
    email: "info@indiasrestaurant.com",
    website: "https://indiasrestaurant.com",
    average_rating: 4.4,
    total_reviews: 156,
    price_range: 2,
    year_opened: 2013,
    hours: "Daily: 11:30am-2:30pm, 5:30pm-10pm",
    menu_url: "https://indiasrestaurant.com/menu",
    logo_url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100&h=100&fit=crop&crop=center",
    cover_image_url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=250&fit=crop&crop=center",
    slug: "indias-restaurant",
    primary_cuisine: { name: "Indian" },
    secondary_cuisine: { name: "Vegetarian" },
    tertiary_cuisine: null,
    area: { name: "Katy" },
    delivery_available: true,
    takeout_available: true,
    kid_friendly: true,
    wifi_available: true
  },
  {
    id: 12,
    name: "The Catch Seafood & Grill",
    description: "Fresh Gulf seafood with daily catches, premium steaks, and waterfront dining atmosphere.",
    address: "2100 S Mason Rd, Katy, TX 77450",
    phone: "(281) 579-3474",
    email: "info@thecatchkaty.com",
    website: "https://thecatchkaty.com",
    average_rating: 4.7,
    total_reviews: 298,
    price_range: 4,
    year_opened: 2017,
    hours: "Mon-Thu: 4pm-10pm, Fri-Sat: 4pm-11pm, Sun: 4pm-9pm",
    menu_url: "https://thecatchkaty.com/menu",
    logo_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&h=100&fit=crop&crop=center",
    cover_image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop&crop=center",
    slug: "the-catch-seafood-grill",
    primary_cuisine: { name: "Seafood" },
    secondary_cuisine: { name: "Steakhouse" },
    tertiary_cuisine: null,
    area: { name: "Katy" },
    delivery_available: false,
    takeout_available: true,
    kid_friendly: true,
    wifi_available: true
  }
];

// Mock cuisines data - updated to match actual restaurants
const mockCuisines = [
  { id: 1, name: "American", keywords: "american,burgers,comfort", restaurant_count: 2 },
  { id: 2, name: "Italian", keywords: "italian,pasta,pizza", restaurant_count: 1 },
  { id: 3, name: "Mexican", keywords: "mexican,tex-mex,tacos", restaurant_count: 1 },
  { id: 4, name: "Japanese", keywords: "japanese,sushi,hibachi", restaurant_count: 2 },
  { id: 5, name: "Chinese", keywords: "chinese,asian", restaurant_count: 1 },
  { id: 6, name: "Cajun", keywords: "cajun,creole,louisiana", restaurant_count: 1 },
  { id: 7, name: "Seafood", keywords: "seafood,fish,shrimp", restaurant_count: 1 },
  { id: 8, name: "BBQ", keywords: "bbq,barbecue,brisket,texas", restaurant_count: 1 },
  { id: 9, name: "Indian", keywords: "indian,curry,tandoor", restaurant_count: 1 },
  { id: 10, name: "Thai", keywords: "thai,pad-thai,curry", restaurant_count: 1 }
];

// API Routes

// Add caching for better performance
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get restaurants with filtering and pagination
app.get('/api/restaurants.php', (req, res) => {
  const {
    limit = 20,
    offset = 0,
    cuisine = '',
    area = '',
    search = ''
  } = req.query;

  // Create cache key
  const cacheKey = `restaurants:${limit}:${offset}:${cuisine}:${area}:${search}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return res.json(cached.data);
  }

  // Use real restaurants if available, otherwise fall back to mock data
  const restaurants = realRestaurants.length > 0 ? realRestaurants : mockRestaurants;
  let filteredRestaurants = [...restaurants];

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredRestaurants = filteredRestaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(searchLower) ||
      restaurant.description.toLowerCase().includes(searchLower) ||
      restaurant.primary_cuisine.name.toLowerCase().includes(searchLower) ||
      (restaurant.secondary_cuisine && restaurant.secondary_cuisine.name.toLowerCase().includes(searchLower))
    );
  }

  // Apply cuisine filter
  if (cuisine) {
    const cuisineLower = cuisine.toLowerCase();
    filteredRestaurants = filteredRestaurants.filter(restaurant =>
      restaurant.primary_cuisine.name.toLowerCase().includes(cuisineLower) ||
      (restaurant.secondary_cuisine && restaurant.secondary_cuisine.name.toLowerCase().includes(cuisineLower))
    );
  }

  // Apply area filter
  if (area) {
    const areaLower = area.toLowerCase();
    filteredRestaurants = filteredRestaurants.filter(restaurant =>
      restaurant.area.name.toLowerCase().includes(areaLower) ||
      restaurant.address.toLowerCase().includes(areaLower)
    );
  }

  // Apply pagination
  const startIndex = parseInt(offset);
  const endIndex = startIndex + parseInt(limit);
  const paginatedRestaurants = filteredRestaurants.slice(startIndex, endIndex);

  // Return response
  const response = {
    restaurants: paginatedRestaurants,
    pagination: {
      total: filteredRestaurants.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      has_more: endIndex < filteredRestaurants.length
    },
    filters_applied: {
      search,
      cuisine,
      area
    }
  };

  // Cache the response
  cache.set(cacheKey, {
    data: response,
    timestamp: Date.now()
  });

  res.json(response);
});

// Get cuisines - dynamically calculate from restaurant data
app.get('/api/cuisines.php', (req, res) => {
  const restaurants = realRestaurants.length > 0 ? realRestaurants : mockRestaurants;
  
  // Count restaurants by cuisine
  const cuisineCounts = new Map();
  
  restaurants.forEach(restaurant => {
    // Count primary cuisine
    if (restaurant.primary_cuisine?.name) {
      const cuisine = restaurant.primary_cuisine.name;
      cuisineCounts.set(cuisine, (cuisineCounts.get(cuisine) || 0) + 1);
    }
    
    // Count secondary cuisine
    if (restaurant.secondary_cuisine?.name) {
      const cuisine = restaurant.secondary_cuisine.name;
      cuisineCounts.set(cuisine, (cuisineCounts.get(cuisine) || 0) + 1);
    }
  });

  // Convert to array format with keywords
  const cuisineKeywords = {
    'American': 'american,burgers,comfort',
    'Italian': 'italian,pasta,pizza', 
    'Mexican': 'mexican,tex-mex,tacos',
    'Chinese': 'chinese,asian',
    'Japanese': 'japanese,sushi,hibachi',
    'Thai': 'thai,pad-thai,curry',
    'Indian': 'indian,curry,tandoor',
    'BBQ': 'bbq,barbecue,brisket,texas',
    'Seafood': 'seafood,fish,shrimp',
    'Cajun': 'cajun,creole,louisiana',
    'Korean': 'korean,kimchi,bulgogi',
    'Vietnamese': 'vietnamese,pho,banh-mi',
    'Mediterranean': 'mediterranean,greek,middle-eastern',
    'Pizza': 'pizza,pizzeria',
    'Steakhouse': 'steakhouse,steak,beef',
    'Burger': 'burger,hamburger,fast-food',
    'Breakfast': 'breakfast,brunch,pancakes',
    'Cafe': 'cafe,coffee,pastries',
    'Fast Food': 'fast-food,quick-service',
    'Bakery': 'bakery,bread,pastries',
    'Restaurant': 'restaurant,dining'
  };

  const dynamicCuisines = Array.from(cuisineCounts.entries())
    .map(([name, count], index) => ({
      id: index + 1,
      name: name,
      keywords: cuisineKeywords[name] || name.toLowerCase(),
      restaurant_count: count
    }))
    .sort((a, b) => b.restaurant_count - a.restaurant_count); // Sort by count descending

  res.json(dynamicCuisines);
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET /api/restaurants.php - Get restaurants with filtering and pagination`);
  console.log(`  GET /api/cuisines.php - Get cuisine types`);
});