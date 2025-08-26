// Quick test to verify cuisine links work correctly
const { chromium } = require('playwright');

async function testCuisineLinks() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🧪 Testing Cuisine Link Navigation...\n');

    // Test going to the cuisines page
    await page.goto('http://localhost:5173/cuisines');
    await page.waitForTimeout(2000);

    console.log('✅ Cuisines page loaded successfully');

    // Test clicking on different cuisine links
    const cuisines = ['Italian', 'Mexican', 'BBQ', 'Asian', 'Steakhouse', 'Breakfast'];

    for (const cuisine of cuisines) {
      try {
        console.log(`🔍 Testing ${cuisine} cuisine link...`);

        // Go back to cuisines page
        await page.goto('http://localhost:5173/cuisines');
        await page.waitForTimeout(1000);

        // Click on the cuisine link
        const cuisineLink = page.locator(`text="${cuisine}"`).first();
        
        if (await cuisineLink.isVisible()) {
          await cuisineLink.click();
          await page.waitForTimeout(2000);

          // Check if we're on the restaurants page with the correct filter
          const currentUrl = page.url();
          const hasCorrectFilter = currentUrl.includes(`cuisine=${encodeURIComponent(cuisine)}`);

          if (hasCorrectFilter) {
            console.log(`   ✅ ${cuisine} link works correctly`);
            
            // Check if the cuisine filter is applied in the UI
            const selectedCuisine = page.locator(`select option[selected]:has-text("${cuisine}")`);
            if (await selectedCuisine.isVisible()) {
              console.log(`   ✅ ${cuisine} filter is properly selected in UI`);
            }
          } else {
            console.log(`   ❌ ${cuisine} link failed - URL: ${currentUrl}`);
          }
        } else {
          console.log(`   ⚠️  ${cuisine} link not found on page`);
        }
      } catch (error) {
        console.log(`   ❌ Error testing ${cuisine}: ${error.message}`);
      }
    }

    // Test popular cuisine buttons from homepage
    console.log('\n🏠 Testing homepage cuisine buttons...');
    
    await page.goto('http://localhost:5173/');
    await page.waitForTimeout(2000);

    for (const cuisine of ['Italian', 'Mexican', 'BBQ']) {
      try {
        console.log(`🔍 Testing homepage ${cuisine} button...`);
        
        const cuisineButton = page.locator(`button:has-text("${cuisine}")`);
        
        if (await cuisineButton.isVisible()) {
          await cuisineButton.click();
          await page.waitForTimeout(2000);

          const currentUrl = page.url();
          const hasCorrectFilter = currentUrl.includes(`cuisine=${cuisine}`);

          if (hasCorrectFilter) {
            console.log(`   ✅ Homepage ${cuisine} button works correctly`);
          } else {
            console.log(`   ❌ Homepage ${cuisine} button failed - URL: ${currentUrl}`);
          }
          
          // Go back to homepage for next test
          await page.goto('http://localhost:5173/');
          await page.waitForTimeout(1000);
        } else {
          console.log(`   ⚠️  Homepage ${cuisine} button not found`);
        }
      } catch (error) {
        console.log(`   ❌ Error testing homepage ${cuisine}: ${error.message}`);
      }
    }

    console.log('\n🎯 Cuisine link testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testCuisineLinks().catch(console.error);