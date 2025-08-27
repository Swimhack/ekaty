// Comprehensive validation test for eKaty.com
const { chromium } = require('playwright');

async function validateEkatySite() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🔍 COMPREHENSIVE EKATY.COM VALIDATION TEST\n');
  console.log('=' .repeat(60));

  const testResults = {
    homepage: { passed: 0, total: 0 },
    restaurants: { passed: 0, total: 0 },
    community: { passed: 0, total: 0 },
    navigation: { passed: 0, total: 0 },
    overall: { passed: 0, total: 0 }
  };

  try {
    // Track JavaScript errors
    const jsErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });

    // 1. HOMEPAGE VALIDATION
    console.log('1️⃣  HOMEPAGE VALIDATION');
    console.log('-'.repeat(40));
    
    await page.goto('https://ekaty.com');
    await page.waitForTimeout(5000);
    
    // Check if page loads
    const pageTitle = await page.title();
    const test1 = pageTitle.includes('eKaty.com');
    console.log(`📄 Page title correct: ${test1 ? '✅ PASS' : '❌ FAIL'} (${pageTitle})`);
    testResults.homepage.total++;
    if (test1) testResults.homepage.passed++;
    
    // Check for restaurants on homepage
    const restaurantHeadings = await page.locator('h3').count();
    const test2 = restaurantHeadings > 0;
    console.log(`🏪 Restaurant headings found: ${test2 ? '✅ PASS' : '❌ FAIL'} (${restaurantHeadings} headings)`);
    testResults.homepage.total++;
    if (test2) testResults.homepage.passed++;
    
    // Check for specific restaurants
    const texasTradition = await page.locator('text=Texas Tradition').count();
    const katyVibes = await page.locator('text=Katy Vibes').count();
    const losCucos = await page.locator('text=Los Cucos').count();
    const test3 = texasTradition > 0 && katyVibes > 0 && losCucos > 0;
    console.log(`🍽️  Key restaurants visible: ${test3 ? '✅ PASS' : '❌ FAIL'} (Texas Tradition: ${texasTradition}, Katy Vibes: ${katyVibes}, Los Cucos: ${losCucos})`);
    testResults.homepage.total++;
    if (test3) testResults.homepage.passed++;

    // 2. NAVIGATION VALIDATION
    console.log('\n2️⃣  NAVIGATION VALIDATION');
    console.log('-'.repeat(40));
    
    // Check main navigation links
    const navLinks = ['Restaurants', 'Community', 'Popular', 'Contact'];
    for (const linkText of navLinks) {
      const linkExists = await page.locator(`a:has-text("${linkText}")`).count();
      const test = linkExists > 0;
      console.log(`🔗 ${linkText} link: ${test ? '✅ PASS' : '❌ FAIL'}`);
      testResults.navigation.total++;
      if (test) testResults.navigation.passed++;
    }

    // 3. RESTAURANTS PAGE VALIDATION
    console.log('\n3️⃣  RESTAURANTS PAGE VALIDATION');
    console.log('-'.repeat(40));
    
    await page.goto('https://ekaty.com/restaurants');
    await page.waitForTimeout(5000);
    
    const restaurantsUrl = page.url();
    const test4 = restaurantsUrl.includes('/restaurants');
    console.log(`📍 Restaurants page loads: ${test4 ? '✅ PASS' : '❌ FAIL'} (${restaurantsUrl})`);
    testResults.restaurants.total++;
    if (test4) testResults.restaurants.passed++;
    
    // Check for restaurants page content
    const pageContent = await page.textContent('body');
    const has404 = pageContent.includes('404') || pageContent.includes('not found');
    const test5 = !has404;
    console.log(`📋 No 404 error: ${test5 ? '✅ PASS' : '❌ FAIL'}`);
    testResults.restaurants.total++;
    if (test5) testResults.restaurants.passed++;
    
    // Check for search functionality
    const searchInput = await page.locator('input[placeholder*="Search"], input[placeholder*="restaurant"]').count();
    const test6 = searchInput > 0;
    console.log(`🔍 Search functionality: ${test6 ? '✅ PASS' : '❌ FAIL'}`);
    testResults.restaurants.total++;
    if (test6) testResults.restaurants.passed++;

    // 4. COMMUNITY PAGE VALIDATION
    console.log('\n4️⃣  COMMUNITY PAGE VALIDATION');
    console.log('-'.repeat(40));
    
    await page.goto('https://ekaty.com/community');
    await page.waitForTimeout(5000);
    
    const communityUrl = page.url();
    const test7 = communityUrl.includes('/community');
    console.log(`📍 Community page loads: ${test7 ? '✅ PASS' : '❌ FAIL'} (${communityUrl})`);
    testResults.community.total++;
    if (test7) testResults.community.passed++;
    
    // Check for community content
    const communityContent = await page.textContent('body');
    const hasCommunityChat = communityContent.includes('Community Chat') || communityContent.includes('Community');
    const test8 = hasCommunityChat && !communityContent.includes('404');
    console.log(`💬 Community content loads: ${test8 ? '✅ PASS' : '❌ FAIL'}`);
    testResults.community.total++;
    if (test8) testResults.community.passed++;
    
    // Check for message input
    const messageInput = await page.locator('textarea, input[type="text"]').count();
    const test9 = messageInput > 0;
    console.log(`📝 Message input available: ${test9 ? '✅ PASS' : '❌ FAIL'}`);
    testResults.community.total++;
    if (test9) testResults.community.passed++;

    // 5. OVERALL VALIDATION
    console.log('\n5️⃣  OVERALL VALIDATION');
    console.log('-'.repeat(40));
    
    // Check for JavaScript errors
    const test10 = jsErrors.length === 0;
    console.log(`🚫 No JavaScript errors: ${test10 ? '✅ PASS' : '❌ FAIL'} (${jsErrors.length} errors)`);
    testResults.overall.total++;
    if (test10) testResults.overall.passed++;
    
    if (jsErrors.length > 0) {
      console.log('   JavaScript Errors:');
      jsErrors.slice(0, 3).forEach((error, i) => {
        console.log(`     ${i + 1}. ${error.substring(0, 100)}...`);
      });
    }
    
    // Check for responsive design
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.goto('https://ekaty.com');
    await page.waitForTimeout(2000);
    
    const mobileMenu = await page.locator('button[aria-label*="menu"], .mobile-menu, [class*="hamburger"]').count();
    const test11 = mobileMenu > 0;
    console.log(`📱 Mobile responsive: ${test11 ? '✅ PASS' : '❌ FAIL'}`);
    testResults.overall.total++;
    if (test11) testResults.overall.passed++;

    // FINAL RESULTS
    console.log('\n' + '='.repeat(60));
    console.log('🎯 VALIDATION RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    const categories = [
      { name: 'Homepage', data: testResults.homepage },
      { name: 'Navigation', data: testResults.navigation },
      { name: 'Restaurants Page', data: testResults.restaurants },
      { name: 'Community Page', data: testResults.community },
      { name: 'Overall', data: testResults.overall }
    ];
    
    let totalPassed = 0;
    let totalTests = 0;
    
    categories.forEach(category => {
      const percentage = category.data.total > 0 ? Math.round((category.data.passed / category.data.total) * 100) : 0;
      const status = percentage >= 80 ? '✅' : percentage >= 60 ? '⚠️' : '❌';
      console.log(`${status} ${category.name}: ${category.data.passed}/${category.data.total} (${percentage}%)`);
      totalPassed += category.data.passed;
      totalTests += category.data.total;
    });
    
    const overallPercentage = Math.round((totalPassed / totalTests) * 100);
    const overallStatus = overallPercentage >= 80 ? '🟢 EXCELLENT' : overallPercentage >= 60 ? '🟡 GOOD' : '🔴 NEEDS ATTENTION';
    
    console.log('\n📊 OVERALL SITE HEALTH: ' + overallStatus);
    console.log(`📈 Total Score: ${totalPassed}/${totalTests} (${overallPercentage}%)`);
    
    if (overallPercentage < 80) {
      console.log('\n🔧 RECOMMENDED ACTIONS:');
      if (testResults.restaurants.passed / testResults.restaurants.total < 0.8) {
        console.log('   • Fix restaurant page loading and search functionality');
      }
      if (testResults.community.passed / testResults.community.total < 0.8) {
        console.log('   • Resolve community chat loading issues');
      }
      if (jsErrors.length > 0) {
        console.log('   • Address JavaScript errors affecting functionality');
      }
    }
    
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Validation test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the validation
validateEkatySite().catch(console.error);