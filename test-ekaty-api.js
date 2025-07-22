import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:8081';

// Test results storage
const testResults = {
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  }
};

function logTest(testName, passed, details) {
  const result = {
    name: testName,
    passed,
    details,
    timestamp: new Date().toISOString()
  };
  
  testResults.tests.push(result);
  testResults.summary.total++;
  
  if (passed) {
    testResults.summary.passed++;
    console.log(`✓ ${testName}`);
  } else {
    testResults.summary.failed++;
    testResults.summary.errors.push(details);
    console.log(`✗ ${testName}: ${details}`);
  }
  
  if (details && typeof details === 'string' && !details.startsWith('Error:')) {
    console.log(`  ${details}`);
  }
}

async function testAPIEndpoint(endpoint, expectedType = 'array') {
  try {
    console.log(`\n=== Testing ${endpoint} ===`);
    const response = await fetch(`${BASE_URL}${endpoint}`);
    
    logTest(`${endpoint} - Response status`, response.ok, `Status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Handle different API response formats
    let actualData = data;
    let dataToTest = data;
    
    // For restaurants endpoint, extract the restaurants array from the wrapper object
    if (endpoint.includes('restaurants') && data.restaurants) {
      actualData = data.restaurants;
      dataToTest = actualData;
    }
    
    const isCorrectType = expectedType === 'array' ? Array.isArray(dataToTest) : typeof dataToTest === expectedType;
    
    logTest(`${endpoint} - Response type`, isCorrectType, `Expected: ${expectedType}, Got: ${Array.isArray(dataToTest) ? 'array' : typeof dataToTest}`);
    
    if (Array.isArray(dataToTest)) {
      logTest(`${endpoint} - Data available`, dataToTest.length > 0, `Returned ${dataToTest.length} items`);
      
      // Log sample data
      if (dataToTest.length > 0) {
        console.log('Sample data:', JSON.stringify(dataToTest[0], null, 2));
      }
    }
    
    return actualData;
  } catch (error) {
    logTest(`${endpoint} - Connection`, false, `Error: ${error.message}`);
    return null;
  }
}

async function testHomepage() {
  try {
    console.log('\n=== Testing Homepage ===');
    const response = await fetch(BASE_URL);
    
    logTest('Homepage - Response status', response.ok, `Status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Check for essential HTML elements
    const hasTitle = html.includes('<title>') && html.toLowerCase().includes('ekaty');
    logTest('Homepage - Title present', hasTitle, hasTitle ? 'eKaty title found' : 'Title missing or incorrect');
    
    const hasRestaurantSection = html.includes('restaurant') || html.includes('Restaurant');
    logTest('Homepage - Restaurant content', hasRestaurantSection, 'Restaurant-related content found');
    
    const hasApiCalls = html.includes('api/restaurants') || html.includes('api/cuisines');
    logTest('Homepage - API integration', hasApiCalls, 'API calls referenced in HTML');
    
    // Check for CSS and JS files (including Vite dev server assets)
    const hasCSSFiles = html.includes('.css') || html.includes('vite') || html.includes('main.tsx');
    const hasJSFiles = html.includes('.js') || html.includes('.tsx') || html.includes('type="module"');
    logTest('Homepage - CSS/JS assets', hasCSSFiles && hasJSFiles, 'Frontend assets properly loaded');
    
    // Check for React/Vite setup
    const isReactApp = html.includes('id="root"') || html.includes('react');
    logTest('Homepage - React application', isReactApp, 'React application structure detected');
    
    return html;
  } catch (error) {
    logTest('Homepage - Connection', false, `Error: ${error.message}`);
    return null;
  }
}

async function analyzeRestaurantData(restaurants) {
  if (!restaurants || !Array.isArray(restaurants)) {
    logTest('Restaurant Data - Analysis', false, 'No restaurant data available for analysis');
    return;
  }
  
  console.log('\n=== Restaurant Data Analysis ===');
  
  // Check data quality
  let completeRecords = 0;
  let hasImages = 0;
  let hasRatings = 0;
  let hasPhones = 0;
  let hasAddresses = 0;
  
  const cuisineTypes = new Set();
  
  restaurants.forEach((restaurant, index) => {
    if (restaurant.name && restaurant.description) completeRecords++;
    if (restaurant.cover_image_url || restaurant.logo_url || restaurant.image_url) hasImages++;
    if (restaurant.average_rating || restaurant.rating) hasRatings++;
    if (restaurant.phone) hasPhones++;
    if (restaurant.address) hasAddresses++;
    
    // Extract cuisine from different possible fields
    const cuisine = restaurant.cuisine || 
                   (restaurant.primary_cuisine && restaurant.primary_cuisine.name) || 
                   restaurant.cuisine_type;
    if (cuisine) cuisineTypes.add(cuisine);
    
    // Log first few restaurants for review
    if (index < 3) {
      console.log(`Restaurant ${index + 1}:`);
      console.log(`  Name: ${restaurant.name || 'Missing'}`);
      console.log(`  Cuisine: ${cuisine || 'Missing'}`);
      console.log(`  Description: ${(restaurant.description || 'Missing').substring(0, 50)}...`);
      console.log(`  Phone: ${restaurant.phone || 'Missing'}`);
      console.log(`  Address: ${restaurant.address || 'Missing'}`);
      console.log(`  Rating: ${restaurant.average_rating || restaurant.rating || 'Missing'}`);
      console.log(`  Image: ${(restaurant.cover_image_url || restaurant.logo_url || restaurant.image_url) ? 'Present' : 'Missing'}`);
      console.log('---');
    }
  });
  
  const total = restaurants.length;
  logTest('Restaurant Data - Complete records', completeRecords > 0, `${completeRecords}/${total} restaurants have name and description`);
  logTest('Restaurant Data - Images available', hasImages > 0, `${hasImages}/${total} restaurants have image URLs`);
  logTest('Restaurant Data - Ratings available', hasRatings > 0, `${hasRatings}/${total} restaurants have ratings`);
  logTest('Restaurant Data - Phone numbers', hasPhones > 0, `${hasPhones}/${total} restaurants have phone numbers`);
  logTest('Restaurant Data - Addresses', hasAddresses > 0, `${hasAddresses}/${total} restaurants have addresses`);
  logTest('Restaurant Data - Cuisine diversity', cuisineTypes.size > 1, `${cuisineTypes.size} different cuisine types found`);
  
  console.log(`Cuisine types: ${Array.from(cuisineTypes).join(', ')}`);
}

async function analyzeCuisineData(cuisines) {
  if (!cuisines || !Array.isArray(cuisines)) {
    logTest('Cuisine Data - Analysis', false, 'No cuisine data available for analysis');
    return;
  }
  
  console.log('\n=== Cuisine Data Analysis ===');
  
  let totalRestaurants = 0;
  cuisines.forEach((cuisine, index) => {
    const count = parseInt(cuisine.restaurant_count || cuisine.count) || 0;
    totalRestaurants += count;
    if (index < 5) { // Log first 5 cuisines
      console.log(`${cuisine.name || cuisine.cuisine}: ${count} restaurants`);
    }
  });
  
  logTest('Cuisine Data - Categories available', cuisines.length > 0, `${cuisines.length} cuisine categories found`);
  logTest('Cuisine Data - Restaurant counts', totalRestaurants > 0, `Total of ${totalRestaurants} restaurant entries across all cuisines`);
  logTest('Cuisine Data - Proper structure', cuisines.every(c => (c.name || c.cuisine) && (c.restaurant_count || c.count)), 'All cuisine entries have name and count');
}

async function testStaticAssets() {
  console.log('\n=== Testing Static Assets ===');
  
  const commonAssets = [
    '/css/style.css',
    '/css/main.css',
    '/js/app.js',
    '/js/main.js',
    '/js/script.js'
  ];
  
  for (const asset of commonAssets) {
    try {
      const response = await fetch(`${BASE_URL}${asset}`);
      if (response.ok) {
        logTest(`Static Asset - ${asset}`, true, 'File exists and accessible');
      }
    } catch (error) {
      // Don't log missing assets as failures since we're guessing file names
    }
  }
}

async function runComprehensiveTests() {
  console.log('🚀 Starting eKaty.com Comprehensive Testing');
  console.log('=' .repeat(50));
  
  // Test homepage
  const homepageContent = await testHomepage();
  
  // Test API endpoints
  const restaurantData = await testAPIEndpoint('/api/restaurants.php', 'array');
  const cuisineData = await testAPIEndpoint('/api/cuisines.php', 'array');
  
  // Analyze data quality
  if (restaurantData) {
    await analyzeRestaurantData(restaurantData);
  }
  
  if (cuisineData) {
    await analyzeCuisineData(cuisineData);
  }
  
  // Test static assets
  await testStaticAssets();
  
  // Generate report
  console.log('\n' + '=' .repeat(50));
  console.log('🎯 TEST SUMMARY');
  console.log('=' .repeat(50));
  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`Passed: ${testResults.summary.passed}`);
  console.log(`Failed: ${testResults.summary.failed}`);
  console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);
  
  if (testResults.summary.errors.length > 0) {
    console.log('\n❌ Issues Found:');
    testResults.summary.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  // Save detailed report
  const reportPath = path.join(process.cwd(), 'test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📊 Detailed report saved to: ${reportPath}`);
  
  return testResults;
}

// Run the tests
runComprehensiveTests().catch(console.error);