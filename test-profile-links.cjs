// Test for working restaurant profile links and navigation
const { chromium } = require('playwright');

async function testProfileLinks() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🔗 TESTING RESTAURANT PROFILE LINKS & NAVIGATION\n');
    console.log('=' .repeat(60));

    // Go to homepage first
    await page.goto('https://ekaty.com');
    await page.waitForTimeout(3000);
    
    console.log('📍 Testing all link types on homepage...\n');
    
    // Test different link patterns
    const linkPatterns = [
      'a[href*="/restaurant"]',
      'a[href*="restaurant"]', 
      'button[onclick*="restaurant"]',
      '.restaurant-card a',
      '[data-testid*="restaurant"] a',
      'a:has(h3)',
      'a:has(img[alt*="restaurant"])',
      '[class*="card"] a',
      'a[href*="profile"]',
      'a[href*="detail"]'
    ];
    
    let workingLinks = [];
    
    for (const pattern of linkPatterns) {
      try {
        const links = await page.locator(pattern).all();
        console.log(`🔍 Pattern "${pattern}": Found ${links.length} links`);
        
        for (let i = 0; i < Math.min(links.length, 3); i++) {
          try {
            const href = await links[i].getAttribute('href');
            const text = await links[i].textContent();
            const isVisible = await links[i].isVisible();
            
            if (href && isVisible) {
              workingLinks.push({
                pattern,
                href,
                text: text?.trim().substring(0, 30) || 'No text',
                element: links[i]
              });
              console.log(`   ✅ Found working link: "${text?.trim().substring(0, 25)}..." → ${href}`);
            }
          } catch (e) {
            // Skip invalid links
          }
        }
      } catch (e) {
        console.log(`   ❌ Pattern "${pattern}" failed: ${e.message.substring(0, 30)}...`);
      }
    }
    
    console.log(`\n🎯 TOTAL WORKING PROFILE LINKS FOUND: ${workingLinks.length}\n`);
    
    if (workingLinks.length === 0) {
      console.log('❌ NO WORKING RESTAURANT PROFILE LINKS FOUND');
      console.log('🔍 This explains why restaurant profiles cannot be accessed');
      console.log('\n📋 TESTING ALTERNATIVE APPROACHES...\n');
      
      // Test manual URL patterns
      const testUrls = [
        'https://ekaty.com/restaurant/texas-tradition',
        'https://ekaty.com/restaurant/katy-vibes', 
        'https://ekaty.com/restaurant/los-cucos',
        'https://ekaty.com/restaurants/texas-tradition',
        'https://ekaty.com/profile/texas-tradition',
        'https://ekaty.com/restaurants/1',
        'https://ekaty.com/restaurant/1'
      ];
      
      console.log('🔗 Testing manual restaurant profile URLs...\n');
      
      for (let i = 0; i < testUrls.length; i++) {
        const testUrl = testUrls[i];
        console.log(`${i + 1}. 🧪 Testing: ${testUrl}`);
        
        try {
          await page.goto(testUrl);
          await page.waitForTimeout(2000);
          
          const finalUrl = page.url();
          const pageTitle = await page.title();
          
          if (finalUrl === testUrl) {
            console.log(`   ✅ URL ACCESSIBLE: "${pageTitle}"`);
            
            // Check if it looks like a restaurant profile
            const hasProfileContent = await page.locator('text=/address|phone|hours|menu|review/i').count() > 0;
            if (hasProfileContent) {
              console.log(`   🎉 APPEARS TO BE RESTAURANT PROFILE!`);
            } else {
              console.log(`   ⚠️  Not a restaurant profile page`);
            }
          } else {
            console.log(`   🔄 REDIRECTED TO: ${finalUrl}`);
          }
          
        } catch (urlError) {
          console.log(`   ❌ Failed: ${urlError.message.substring(0, 40)}...`);
        }
      }
      
    } else {
      console.log('✅ TESTING WORKING PROFILE LINKS...\n');
      
      // Test the first few working links
      for (let i = 0; i < Math.min(workingLinks.length, 3); i++) {
        const link = workingLinks[i];
        
        console.log(`${i + 1}. 🔍 TESTING LINK: "${link.text}"`);
        console.log(`   📍 URL: ${link.href}`);
        console.log(`   🖱️  Clicking...`);
        
        try {
          await link.element.click();
          await page.waitForTimeout(3000);
          
          const currentUrl = page.url();
          const pageTitle = await page.title();
          
          console.log(`   ✅ NAVIGATION SUCCESSFUL!`);
          console.log(`   📍 Current URL: ${currentUrl}`);
          console.log(`   📄 Page title: "${pageTitle}"`);
          
          // Test for profile tabs
          const tabs = await page.locator('button, a').filter({ 
            hasText: /overview|menu|reviews|photos|info|about|hours|contact|details/i 
          }).all();
          
          console.log(`   📋 Profile tabs found: ${tabs.length}`);
          
          if (tabs.length > 0) {
            console.log(`   🎯 Testing profile tabs...`);
            for (let j = 0; j < Math.min(tabs.length, 3); j++) {
              try {
                const tabText = await tabs[j].textContent();
                console.log(`     🔸 Testing: "${tabText?.substring(0, 15)}..."`);
                await tabs[j].click();
                await page.waitForTimeout(1000);
                console.log(`     ✅ Tab working`);
              } catch (tabError) {
                console.log(`     ❌ Tab failed`);
              }
            }
          }
          
          // Go back to homepage for next test
          await page.goto('https://ekaty.com');
          await page.waitForTimeout(2000);
          
        } catch (linkError) {
          console.log(`   ❌ Link click failed: ${linkError.message.substring(0, 40)}...`);
        }
        
        console.log(''); // Blank line
      }
    }
    
    console.log('='.repeat(60));
    console.log('🎯 PROFILE LINKS TESTING COMPLETED');
    console.log(`📊 Working profile links found: ${workingLinks.length}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testProfileLinks().catch(console.error);