// API debugging test for restaurant search functionality
const { chromium } = require('playwright');

async function testAPIDebugging() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🔍 STARTING API DEBUGGING TEST\n');
    console.log('=' .repeat(50));

    // Enable console logging to capture API calls
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('🔍') || text.includes('Restaurant') || text.includes('API') || text.includes('ERROR') || text.includes('response')) {
        console.log(`🌐 BROWSER LOG: ${text}`);
      }
    });

    console.log('1️⃣  TESTING HOMEPAGE DATA LOADING');
    console.log('-'.repeat(30));
    
    // Go to homepage first
    await page.goto('https://ekaty.com');
    await page.waitForTimeout(5000);
    
    // Check if homepage has restaurant data
    const homepageH3s = await page.locator('h3').allTextContents();
    const restaurantNames = homepageH3s.filter(text => 
      text && 
      !text.toLowerCase().includes('explore') && 
      !text.toLowerCase().includes('discover') &&
      text.length > 3
    );
    
    console.log(`📊 Homepage total H3 elements: ${homepageH3s.length}`);
    console.log(`🍽️  Potential restaurant names: ${restaurantNames.length}`);
    console.log('📋 Restaurant names found on homepage:');
    restaurantNames.slice(0, 10).forEach((name, i) => {
      console.log(`   ${i + 1}. "${name}"`);
    });

    console.log('\n2️⃣  TESTING RESTAURANTS PAGE DATA LOADING');
    console.log('-'.repeat(30));
    
    // Now go to restaurants page
    console.log('🌐 Navigating to https://ekaty.com/restaurants...');
    await page.goto('https://ekaty.com/restaurants');
    console.log('✅ Navigation completed');
    
    // Wait for page to fully load and capture console logs
    await page.waitForTimeout(10000);
    
    // Check the current URL
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // Check what's actually displayed on the page
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);
    
    // Look for key elements
    const bodyText = await page.textContent('body');
    console.log(`📝 Page content length: ${bodyText.length} characters`);
    
    // Check for specific content
    if (bodyText.includes('404') || bodyText.toLowerCase().includes('not found')) {
      console.log('❌ RESTAURANTS PAGE SHOWS 404 ERROR');
    } else if (bodyText.includes('No restaurants found')) {
      console.log('⚠️  RESTAURANTS PAGE SHOWS "NO RESTAURANTS FOUND"');
    } else if (bodyText.includes('Loading')) {
      console.log('⏳ RESTAURANTS PAGE IS STILL LOADING');
    } else {
      console.log('✅ RESTAURANTS PAGE LOADED WITH CONTENT');
    }

    // Check for restaurant-related content
    const restaurantsPageH3s = await page.locator('h3').allTextContents();
    console.log(`📊 Restaurants page H3 elements: ${restaurantsPageH3s.length}`);
    
    if (restaurantsPageH3s.length > 0) {
      console.log('📋 H3 content on restaurants page:');
      restaurantsPageH3s.slice(0, 10).forEach((text, i) => {
        console.log(`   ${i + 1}. "${text}"`);
      });
    }

    // Check for restaurant cards or listings
    const cardElements = await page.locator('[class*="card"], .restaurant, article').count();
    console.log(`🏪 Restaurant card elements: ${cardElements}`);

    // Check for loading indicators
    const loadingElements = await page.locator('text=/loading/i, [class*="loading"], [class*="skeleton"]').count();
    console.log(`⏳ Loading indicator elements: ${loadingElements}`);

    // Check for error elements
    const errorElements = await page.locator('text=/error|failed|timeout/i').count();
    console.log(`❌ Error indicator elements: ${errorElements}`);

    // Check for specific text content that might indicate the issue
    const hasNoResults = bodyText.toLowerCase().includes('no restaurants found');
    const hasError = bodyText.toLowerCase().includes('error');
    const hasTimeout = bodyText.toLowerCase().includes('timeout');
    const hasCloudflare = bodyText.toLowerCase().includes('cloudflare');
    
    console.log(`🔍 Content analysis:`);
    console.log(`   - Has "No restaurants found": ${hasNoResults}`);
    console.log(`   - Has error messages: ${hasError}`);
    console.log(`   - Has timeout messages: ${hasTimeout}`);
    console.log(`   - Has Cloudflare messages: ${hasCloudflare}`);

    console.log('\n3️⃣  COMPARING HOMEPAGE vs RESTAURANTS PAGE');
    console.log('-'.repeat(30));
    
    console.log(`📊 COMPARISON:`);
    console.log(`   Homepage restaurant names: ${restaurantNames.length}`);
    console.log(`   Restaurants page H3s: ${restaurantsPageH3s.length}`);
    console.log(`   Restaurants page cards: ${cardElements}`);
    
    if (restaurantNames.length > 0 && cardElements === 0) {
      console.log('🚨 CRITICAL ISSUE: Homepage shows restaurants but restaurants page shows none!');
      console.log('💡 This suggests a routing or API connectivity issue on the restaurants page.');
    }

    console.log('\n4️⃣  MANUAL INSPECTION PAUSE');
    console.log('-'.repeat(30));
    console.log('🔍 Browser window left open for manual inspection');
    console.log('💡 Check the browser console and network tabs for additional details');
    console.log('🛑 The test will continue in 30 seconds...');
    
    await page.waitForTimeout(30000);

    console.log('\n=' .repeat(50));
    console.log('🎯 API DEBUGGING TEST COMPLETED');
    console.log('\n📋 SUMMARY:');
    console.log(`   - Homepage working: ${restaurantNames.length > 0 ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Restaurants page working: ${cardElements > 0 ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Issue detected: ${restaurantNames.length > 0 && cardElements === 0 ? '🚨 CRITICAL' : '✅ NONE'}`);
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testAPIDebugging().catch(console.error);