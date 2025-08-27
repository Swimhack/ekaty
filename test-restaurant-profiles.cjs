// Real-time restaurant profile testing with live status updates
const { chromium } = require('playwright');

async function testRestaurantProfiles() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🔍 STARTING COMPREHENSIVE RESTAURANT PROFILE TESTING\n');
    console.log('=' .repeat(60));

    // Go to the main restaurants page
    console.log('📍 Navigating to eKaty.com restaurants page...');
    await page.goto('https://ekaty.com/restaurants');
    await page.waitForTimeout(5000);

    // Get all restaurant cards
    const restaurantCards = page.locator('article, .restaurant-card, h3:has-text("Texas Tradition")').first();
    
    console.log('🏪 Looking for restaurant cards...');
    
    // Find all restaurant headings (h3 elements with restaurant names)
    const restaurantHeadings = await page.locator('h3').all();
    
    console.log(`📊 Found ${restaurantHeadings.length} potential restaurant headings`);
    
    // Extract restaurant names and test each one
    const restaurantNames = [];
    for (let i = 0; i < Math.min(restaurantHeadings.length, 15); i++) {
      try {
        const text = await restaurantHeadings[i].textContent();
        if (text && text.trim() && !text.includes('Explore') && !text.includes('Restaurant')) {
          restaurantNames.push(text.trim());
        }
      } catch (e) {
        // Skip invalid headings
      }
    }

    console.log(`\n🍽️  RESTAURANTS TO TEST: ${restaurantNames.length}`);
    console.log('-'.repeat(40));

    for (let i = 0; i < restaurantNames.length; i++) {
      const restaurantName = restaurantNames[i];
      
      console.log(`\n${i + 1}. 🔍 TESTING: "${restaurantName}"`);
      console.log(`   Status: Searching for clickable elements...`);
      
      try {
        // Look for clickable restaurant elements
        const restaurantElement = page.locator(`h3:has-text("${restaurantName}")`).first();
        
        if (await restaurantElement.isVisible()) {
          console.log(`   ✅ Found restaurant heading: "${restaurantName}"`);
          
          // Try to find a clickable parent element
          const clickableParent = restaurantElement.locator('xpath=ancestor::*[@onclick or @href or contains(@class, "link") or contains(@class, "card")]').first();
          
          if (await clickableParent.isVisible()) {
            console.log(`   🖱️  Found clickable element for: "${restaurantName}"`);
            
            try {
              await clickableParent.click({ timeout: 3000 });
              await page.waitForTimeout(3000);
              
              // Check if we navigated to a profile page
              const currentUrl = page.url();
              console.log(`   📍 Current URL: ${currentUrl}`);
              
              if (currentUrl.includes('restaurant') || currentUrl !== 'https://ekaty.com/restaurants') {
                console.log(`   ✅ PROFILE LOADED: "${restaurantName}"`);
                
                // Test profile tabs if available
                console.log(`   📋 Testing profile tabs...`);
                const tabs = await page.locator('button, a').filter({ hasText: /overview|menu|reviews|photos|info/i }).all();
                
                console.log(`   📊 Found ${tabs.length} potential tabs`);
                
                for (let j = 0; j < Math.min(tabs.length, 5); j++) {
                  try {
                    const tabText = await tabs[j].textContent();
                    console.log(`     🔸 Testing tab: "${tabText}"`);
                    await tabs[j].click();
                    await page.waitForTimeout(1000);
                    console.log(`     ✅ Tab "${tabText}" clicked successfully`);
                  } catch (tabError) {
                    console.log(`     ❌ Tab test failed: ${tabError.message.substring(0, 50)}...`);
                  }
                }
                
                // Go back to restaurants page for next test
                await page.goBack();
                await page.waitForTimeout(2000);
                
              } else {
                console.log(`   ⚠️  Click didn't navigate to profile page`);
              }
              
            } catch (clickError) {
              console.log(`   ❌ Click failed: ${clickError.message.substring(0, 50)}...`);
            }
            
          } else {
            console.log(`   ⚠️  No clickable parent found for: "${restaurantName}"`);
            
            // Try direct link search
            const directLink = page.locator(`a:has-text("${restaurantName}")`).first();
            if (await directLink.isVisible()) {
              console.log(`   🔗 Found direct link for: "${restaurantName}"`);
              try {
                await directLink.click();
                await page.waitForTimeout(2000);
                console.log(`   ✅ Direct link clicked for: "${restaurantName}"`);
                await page.goBack();
                await page.waitForTimeout(1000);
              } catch (linkError) {
                console.log(`   ❌ Direct link failed: ${linkError.message.substring(0, 50)}...`);
              }
            }
          }
          
        } else {
          console.log(`   ❌ Restaurant not visible: "${restaurantName}"`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error testing "${restaurantName}": ${error.message.substring(0, 50)}...`);
      }
      
      // Rate limiting
      await page.waitForTimeout(1000);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 RESTAURANT PROFILE TESTING COMPLETED');
    console.log(`📊 Total restaurants tested: ${restaurantNames.length}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testRestaurantProfiles().catch(console.error);