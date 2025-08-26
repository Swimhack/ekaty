#!/usr/bin/env node

/**
 * Test script for restaurant synchronization system
 * This script will test the Google Places API connection and validate
 * the synchronization process before implementing full automation
 */

import RestaurantSyncService from './restaurant-sync-service.js';
import GooglePlacesService from './google-places-service.js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}

async function testGooglePlacesConnection() {
  console.log('🧪 Testing Google Places API Connection...');
  
  try {
    const googlePlaces = new GooglePlacesService(process.env.GOOGLE_PLACES_API_KEY);
    
    // Test with a simple search first
    console.log('   → Testing basic restaurant search...');
    const basicResults = await googlePlaces.searchRestaurants('', 5);
    console.log(`   ✅ Successfully fetched ${basicResults.length} restaurants from basic search`);
    
    if (basicResults.length > 0) {
      console.log(`   📝 Sample restaurant: ${basicResults[0].name} - ${basicResults[0].address}`);
      console.log(`   ⭐ Rating: ${basicResults[0].average_rating} (${basicResults[0].total_reviews} reviews)`);
    }
    
    return true;
  } catch (error) {
    console.error('   ❌ Google Places API test failed:', error.message);
    
    if (error.message.includes('REQUEST_DENIED')) {
      console.error('   💡 Possible solutions:');
      console.error('      1. Enable the Places API in Google Cloud Console');
      console.error('      2. Check API key restrictions');
      console.error('      3. Verify billing is enabled');
    }
    
    return false;
  }
}

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Database Connection...');
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
    };
    
    // Test connection by fetching restaurant count
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/restaurants?select=count`,
      { headers }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`   ✅ Successfully connected to Supabase`);
    console.log(`   📊 Current restaurants in database: ${data[0]?.count || 'unknown'}`);
    
    return true;
  } catch (error) {
    console.error('   ❌ Supabase connection test failed:', error.message);
    return false;
  }
}

async function testDataMapping() {
  console.log('🧪 Testing Data Mapping Functions...');
  
  try {
    // Mock Google Places data
    const mockGoogleData = {
      name: 'Test Restaurant',
      address: '123 Test St, Katy, TX 77494',
      average_rating: 4.5,
      total_reviews: 123,
      price_range: 2,
      primary_cuisine: { name: 'American' },
      phone: '(281) 555-0123',
      website: 'https://testrestaurant.com',
      hours: 'Mon-Sun: 11AM-10PM',
      google_place_id: 'test_place_id_123',
      latitude: 29.7859,
      longitude: -95.8244
    };
    
    const syncService = new RestaurantSyncService(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      process.env.GOOGLE_PLACES_API_KEY
    );
    
    const mappedData = syncService.mapGoogleToSupabaseSchema(mockGoogleData);
    
    console.log('   ✅ Data mapping successful');
    console.log(`   📝 Mapped restaurant: ${mappedData.name}`);
    console.log(`   🏷️  Cuisines: ${mappedData.cuisine.join(', ')}`);
    console.log(`   📍 Distance from Katy center: ${mappedData.distance} miles`);
    
    return true;
  } catch (error) {
    console.error('   ❌ Data mapping test failed:', error.message);
    return false;
  }
}

async function testDryRun() {
  console.log('🧪 Testing Dry Run Synchronization...');
  
  try {
    // Fetch a small sample from Google Places
    const googlePlaces = new GooglePlacesService(process.env.GOOGLE_PLACES_API_KEY);
    const sampleRestaurants = await googlePlaces.searchRestaurants('pizza', 3);
    
    if (sampleRestaurants.length === 0) {
      console.warn('   ⚠️  No restaurants returned from Google Places API');
      return false;
    }
    
    console.log(`   ✅ Successfully fetched ${sampleRestaurants.length} sample restaurants`);
    
    // Test data processing without database writes
    const syncService = new RestaurantSyncService(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      process.env.GOOGLE_PLACES_API_KEY
    );
    
    for (const restaurant of sampleRestaurants) {
      const mappedData = syncService.mapGoogleToSupabaseSchema(restaurant);
      console.log(`   📝 Processed: ${mappedData.name} (${mappedData.cuisine.join(', ')})`);
    }
    
    return true;
  } catch (error) {
    console.error('   ❌ Dry run test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Restaurant Sync System Tests');
  console.log('='.repeat(50));
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY', 
    'GOOGLE_PLACES_API_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
  }
  
  const tests = [
    { name: 'Google Places API Connection', fn: testGooglePlacesConnection },
    { name: 'Supabase Database Connection', fn: testSupabaseConnection },
    { name: 'Data Mapping Functions', fn: testDataMapping },
    { name: 'Dry Run Synchronization', fn: testDryRun }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n📋 Running: ${test.name}`);
    
    try {
      const result = await test.fn();
      if (result) {
        passed++;
        console.log(`   ✅ PASSED: ${test.name}`);
      } else {
        failed++;
        console.log(`   ❌ FAILED: ${test.name}`);
      }
    } catch (error) {
      failed++;
      console.log(`   💥 ERROR: ${test.name} - ${error.message}`);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Ready for full synchronization.');
    console.log('💡 Next steps:');
    console.log('   1. Run: node server/sync-restaurants.js');
    console.log('   2. Set up daily cron job');
    console.log('   3. Deploy Edge Function for automated scheduling');
  } else {
    console.log('\n⚠️  Some tests failed. Please fix the issues before proceeding.');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });
}

export default runAllTests;