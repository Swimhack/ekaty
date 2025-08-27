// API debugging test for restaurant search functionality
const { chromium } = require('playwright');

async function testAPIDebugging() {
  const browser = await chromium.launch({ headless: false, devtools: true });
  const page = await browser.newPage();

  try {
    console.log('🔍 STARTING API DEBUGGING TEST\n');
    console.log('=' .repeat(50));

    // Enable console logging
    page.on('console', msg => {
      console.log(`🌐 BROWSER LOG: ${msg.text()}`);
    });

    // Enable network request logging
    page.on('request', request => {
      if (request.url().includes('supabase') || request.url().includes('api')) {
        console.log(`📡 REQUEST: ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', response => {
      if (response.url().includes('supabase') || response.url().includes('api')) {
        console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
      }
    });

    console.log('1️⃣  TESTING HOMEPAGE DATA LOADING');
    console.log('-'.repeat(30));
    
    // Go to homepage first
    await page.goto('https://ekaty.com');
    await page.waitForTimeout(10000); // Wait for all data to load
    
    // Check if homepage has restaurant data
    const homepageRestaurants = await page.locator('h3').allTextContents();
    console.log(`📊 Homepage restaurants found: ${homepageRestaurants.length}`);
    console.log('📋 Homepage restaurant names:', homepageRestaurants.slice(0, 10));

    console.log('\n2️⃣  TESTING RESTAURANTS PAGE DATA LOADING');
    console.log('-'.repeat(30));
    
    // Now go to restaurants page
    await page.goto('https://ekaty.com/restaurants');
    await page.waitForTimeout(15000); // Wait longer for API calls
    
    // Check what's on the page
    const pageText = await page.textContent('body');
    console.log(`📄 Page content length: ${pageText.length} characters`);
    
    if (pageText.includes('404') || pageText.includes('not found')) {
      console.log('❌ RESTAURANTS PAGE SHOWS 404');
    } else if (pageText.includes('No restaurants found')) {
      console.log('⚠️  RESTAURANTS PAGE SHOWS "NO RESTAURANTS FOUND"');
    } else {
      console.log('✅ RESTAURANTS PAGE LOADS CORRECTLY');
    }

    // Look for specific console logs
    await page.waitForTimeout(5000);
    
    // Check for loading states
    const loadingElements = await page.locator('text=/loading/i').count();
    console.log(`⏳ Loading elements found: ${loadingElements}`);
    
    // Check for error messages
    const errorElements = await page.locator('text=/error|failed|timeout/i').count();
    console.log(`❌ Error elements found: ${errorElements}`);

    // Check for actual restaurant cards
    const restaurantCards = await page.locator('[class*="card"], article, .restaurant').count();
    console.log(`🏪 Restaurant cards found: ${restaurantCards}`);

    // Check the URL to make sure we're on the right page
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);

    console.log('\n3️⃣  CHECKING NETWORK REQUESTS');
    console.log('-'.repeat(30));
    
    // Wait a bit more to capture any delayed requests
    await page.waitForTimeout(5000);
    
    console.log('🔍 Check the browser console logs above for API requests and responses');

    console.log('\n4️⃣  MANUAL RESTAURANT COUNT CHECK');
    console.log('-'.repeat(30));
    
    // Try to manually count restaurant-related elements
    const allH3s = await page.locator('h3').allTextContents();
    console.log(`📝 All H3 elements on restaurants page: ${allH3s.length}`);
    if (allH3s.length > 0) {
      console.log('📋 H3 contents:', allH3s.slice(0, 10));
    }

    const allDivs = await page.locator('div').count();
    console.log(`📦 Total divs on page: ${allDivs}`);

    console.log('\n=' .repeat(50));
    console.log('🎯 API DEBUGGING TEST COMPLETED');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('\n🔍 Browser kept open for manual inspection...');
    console.log('💡 Check the Network tab and Console for API calls');
    console.log('⏸️  Press Ctrl+C when done inspecting');
    
    // Don't close the browser - let user inspect manually
    await new Promise(() => {}); // Infinite wait
  }
}

// Run the test
testAPIDebugging().catch(console.error);