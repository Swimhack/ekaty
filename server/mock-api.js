import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = 8082;

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
  }
];

// Mock cuisines data
const mockCuisines = [
  { id: 1, name: "American", keywords: "american,burgers,comfort", restaurant_count: 25 },
  { id: 2, name: "Italian", keywords: "italian,pasta,pizza", restaurant_count: 18 },
  { id: 3, name: "Mexican", keywords: "mexican,tex-mex,tacos", restaurant_count: 22 },
  { id: 4, name: "Japanese", keywords: "japanese,sushi,hibachi", restaurant_count: 12 },
  { id: 5, name: "Chinese", keywords: "chinese,asian", restaurant_count: 15 },
  { id: 6, name: "Cajun", keywords: "cajun,creole,louisiana", restaurant_count: 8 },
  { id: 7, name: "Seafood", keywords: "seafood,fish,shrimp", restaurant_count: 10 },
  { id: 8, name: "BBQ", keywords: "bbq,barbecue,brisket", restaurant_count: 14 },
  { id: 9, name: "Indian", keywords: "indian,curry,tandoor", restaurant_count: 9 },
  { id: 10, name: "Thai", keywords: "thai,pad-thai,curry", restaurant_count: 7 }
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

  let filteredRestaurants = [...mockRestaurants];

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

// Get cuisines
app.get('/api/cuisines.php', (req, res) => {
  res.json(mockCuisines);
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET /api/restaurants.php - Get restaurants with filtering and pagination`);
  console.log(`  GET /api/cuisines.php - Get cuisine types`);
});