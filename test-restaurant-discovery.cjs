// Real-time restaurant discovery and profile testing
const { chromium } = require('playwright');

async function testRestaurantDiscovery() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🔍 STARTING REAL-TIME RESTAURANT DISCOVERY TEST\n');
    console.log('=' .repeat(65));

    // Test 1: Homepage Restaurant Discovery
    console.log('🏠 STEP 1: Testing Homepage Restaurant Discovery');
    console.log('-'.repeat(50));
    
    await page.goto('https://ekaty.com');
    await page.waitForTimeout(3000);
    
    console.log('✅ Homepage loaded successfully');
    
    // Look for restaurant-related content
    console.log('🔍 Searching for restaurant content on homepage...');
    
    // Check for restaurant cards or listings
    const restaurantElements = await page.locator('img[alt*="restaurant"], h3, h2, .restaurant, article').all();
    console.log(`📊 Found ${restaurantElements.length} potential restaurant-related elements`);
    
    // Extract restaurant names from visible elements
    const visibleRestaurants = [];
    for (let i = 0; i < Math.min(restaurantElements.length, 30); i++) {
      try {
        const text = await restaurantElements[i].textContent();
        const altText = await restaurantElements[i].getAttribute('alt');
        const content = text || altText || '';
        
        if (content && content.length > 5 && content.length < 50) {
          // Filter for restaurant-like names
          if (content.includes('restaurant') || 
              content.includes('Restaurant') ||
              content.includes('Cafe') ||
              content.includes('Grill') ||
              content.includes('Kitchen') ||
              content.includes('Bar') ||
              content.match(/^[A-Z][a-zA-Z\s'&]+$/)) {
            visibleRestaurants.push(content.trim());
          }
        }
      } catch (e) {
        // Skip invalid elements
      }
    }
    
    // Remove duplicates and show found restaurants
    const uniqueRestaurants = [...new Set(visibleRestaurants)];
    console.log(`\n🍽️  RESTAURANTS DISCOVERED ON HOMEPAGE: ${uniqueRestaurants.length}`);
    
    for (let i = 0; i < Math.min(uniqueRestaurants.length, 10); i++) {
      console.log(`   ${i + 1}. "${uniqueRestaurants[i]}"`);
    }
    
    // Test 2: Navigate to restaurants page
    console.log('\n🏪 STEP 2: Testing Restaurants Page Navigation');
    console.log('-'.repeat(50));
    
    try {
      // Try to find restaurants page link
      const restaurantsLink = page.locator('a[href*="restaurants"], a:has-text("Restaurant"), a:has-text("All Restaurant")').first();
      
      if (await restaurantsLink.isVisible()) {
        console.log('✅ Found restaurants page link');
        await restaurantsLink.click();
        await page.waitForTimeout(3000);
        console.log('✅ Navigated to restaurants page');
      } else {
        // Direct navigation
        console.log('🔗 Direct navigation to restaurants page...');
        await page.goto('https://ekaty.com/restaurants');
        await page.waitForTimeout(3000);
        console.log('✅ Direct navigation successful');
      }
    } catch (navError) {
      console.log('⚠️  Navigation issue, trying direct URL...');
      await page.goto('https://ekaty.com/restaurants');
      await page.waitForTimeout(3000);
    }
    
    // Test 3: Restaurant Profile Discovery
    console.log('\n📋 STEP 3: Testing Restaurant Profile Discovery');
    console.log('-'.repeat(50));
    
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // Look for various restaurant listing patterns
    const profileSearchSelectors = [
      'h3', 'h2', 'h4',  // Headings
      'article', '[class*="restaurant"]', '[class*="card"]', // Cards
      'a[href*="restaurant"]', // Restaurant links
      'img[alt*="restaurant"]', // Restaurant images
      '.restaurant-name', '.name', '.title' // Specific classes
    ];
    
    console.log('🔍 Scanning page for restaurant profiles...');
    
    const foundProfiles = [];
    for (const selector of profileSearchSelectors) {
      try {
        const elements = await page.locator(selector).all();
        console.log(`   📊 Found ${elements.length} elements with selector: ${selector}`);
        
        for (let i = 0; i < Math.min(elements.length, 5); i++) {
          try {
            const element = elements[i];
            if (await element.isVisible()) {
              const text = await element.textContent();
              const href = await element.getAttribute('href');
              const alt = await element.getAttribute('alt');
              
              const content = text || alt || href || '';
              
              if (content && content.trim().length > 0) {
                foundProfiles.push({
                  selector,
                  content: content.trim().substring(0, 50),
                  element: element
                });
              }
            }
          } catch (e) {
            // Skip invalid elements
          }
        }
      } catch (e) {
        console.log(`   ⚠️  Selector "${selector}" failed: ${e.message.substring(0, 30)}...`);
      }
    }
    
    console.log(`\n🎯 TOTAL PROFILE ELEMENTS FOUND: ${foundProfiles.length}`);
    
    // Test 4: Profile Interaction Testing  
    console.log('\n🖱️  STEP 4: Testing Restaurant Profile Interactions');
    console.log('-'.repeat(50));
    
    // Test clicking on first few promising elements
    const testElements = foundProfiles.filter(p => 
      p.content.length > 5 && 
      p.content.length < 40 &&
      !p.content.toLowerCase().includes('search') &&
      !p.content.toLowerCase().includes('filter')
    ).slice(0, 5);
    
    console.log(`🧪 Testing interactions with ${testElements.length} elements...\n`);
    
    for (let i = 0; i < testElements.length; i++) {
      const testItem = testElements[i];
      
      console.log(`${i + 1}. 🔍 TESTING: "${testItem.content}"`);
      console.log(`   📍 Found via selector: ${testItem.selector}`);
      console.log(`   🖱️  Attempting to click...`);
      
      try {
        const currentUrl = page.url();
        
        // Try clicking the element
        await testItem.element.click({ timeout: 3000 });
        await page.waitForTimeout(2000);
        
        const newUrl = page.url();
        
        if (newUrl !== currentUrl) {
          console.log(`   ✅ NAVIGATION SUCCESSFUL!`);
          console.log(`   📍 From: ${currentUrl.substring(20)}...`);
          console.log(`   📍 To: ${newUrl.substring(20)}...`);
          
          // Test if this looks like a restaurant profile
          const pageContent = await page.textContent('body');
          const hasProfileIndicators = pageContent.includes('address') || 
                                     pageContent.includes('phone') || 
                                     pageContent.includes('hours') ||
                                     pageContent.includes('menu') ||
                                     pageContent.includes('review');
          
          if (hasProfileIndicators) {
            console.log(`   🎉 APPEARS TO BE RESTAURANT PROFILE!`);
            
            // Test for tabs
            console.log(`   📋 Looking for profile tabs...`);
            const tabs = await page.locator('button, a').filter({ 
              hasText: /overview|menu|reviews|photos|info|about|hours|contact/i 
            }).all();
            
            console.log(`   📊 Found ${tabs.length} potential tabs`);
            
            if (tabs.length > 0) {
              console.log(`   🎯 Testing first few tabs...`);
              for (let j = 0; j < Math.min(tabs.length, 3); j++) {
                try {
                  const tabText = await tabs[j].textContent();
                  console.log(`     🔸 Testing tab: "${tabText?.substring(0, 20)}..."`);
                  await tabs[j].click();
                  await page.waitForTimeout(1000);
                  console.log(`     ✅ Tab clicked successfully`);
                } catch (tabError) {
                  console.log(`     ❌ Tab failed: ${tabError.message.substring(0, 30)}...`);
                }
              }
            }
            
          } else {
            console.log(`   ⚠️  Doesn't appear to be a restaurant profile`);
          }
          
          // Go back for next test
          console.log(`   ⬅️  Navigating back...`);
          await page.goBack();
          await page.waitForTimeout(1500);
          
        } else {
          console.log(`   ⚠️  No navigation occurred`);
        }
        
      } catch (clickError) {
        console.log(`   ❌ Click failed: ${clickError.message.substring(0, 50)}...`);
      }
      
      console.log(''); // Blank line for readability
    }
    
    console.log('='.repeat(65));
    console.log('🎯 RESTAURANT DISCOVERY TEST COMPLETED');
    console.log(`📊 Homepage restaurants found: ${uniqueRestaurants.length}`);
    console.log(`📊 Profile elements discovered: ${foundProfiles.length}`);
    console.log(`📊 Interactive elements tested: ${testElements.length}`);
    console.log('='.repeat(65));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testRestaurantDiscovery().catch(console.error);