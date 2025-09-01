import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://ekaty.com';

test.describe('Final Production Deployment Validation', () => {

  test('🔥 CRITICAL: Restaurant Route Accessibility Test', async ({ page }) => {
    console.log('🔍 Testing if /restaurants route works after fixes...\n');
    
    // Test direct navigation to restaurants page
    await page.goto(`${PRODUCTION_URL}/restaurants`);
    await page.waitForTimeout(3000);
    
    // Check if page loads without 404
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);
    
    // Look for 404 indicators
    const notFoundElements = page.locator('text=/404|not.*found|page.*not.*exist/i');
    const has404 = await notFoundElements.count() > 0;
    
    if (has404) {
      console.log('❌ Still getting 404 error on /restaurants route');
      const errorText = await notFoundElements.first().textContent();
      console.log(`   Error message: ${errorText}`);
    } else {
      console.log('✅ /restaurants route loads without 404 error');
    }
    
    // Check for restaurant-related content
    const restaurantContent = page.locator('text=/restaurant|cuisine|rating/i');
    const hasContent = await restaurantContent.count() > 0;
    console.log(`📊 Restaurant content found: ${hasContent}`);
    
    // This is the critical test - route must be accessible
    expect(has404).toBeFalsy();
  });

  test('🏠 Homepage Restaurant Count Test', async ({ page }) => {
    console.log('🔍 Testing homepage stats display...\n');
    
    await page.goto(PRODUCTION_URL);
    await page.waitForTimeout(5000); // Give time for stats to load
    
    // Look for restaurant count stats
    const statsElements = page.locator('text=/[0-9]+.*restaurant/i, text=/[0-9]+\+/');
    const statsCount = await statsElements.count();
    
    console.log(`📊 Stats elements found: ${statsCount}`);
    
    if (statsCount > 0) {
      for (let i = 0; i < Math.min(statsCount, 3); i++) {
        const statText = await statsElements.nth(i).textContent();
        console.log(`   📈 Stat ${i + 1}: ${statText}`);
      }
      console.log('✅ Homepage stats are displaying');
    } else {
      console.log('⚠️ Homepage stats still not visible');
      
      // Check for loading states
      const loadingElements = page.locator('text=/loading/, .skeleton');
      const loadingCount = await loadingElements.count();
      console.log(`   ⏳ Loading elements: ${loadingCount}`);
    }
  });

  test('📱 Mobile Navigation Final Test', async ({ page }) => {
    console.log('🔍 Final test of mobile navigation...\n');
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(PRODUCTION_URL);
    await page.waitForTimeout(2000);
    
    // Find and test mobile menu
    const menuButton = page.locator('button[aria-label*="menu"], button').filter({ 
      has: page.locator('svg') 
    }).first();
    
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(1000);
      
      const mobileMenu = page.locator('nav').filter({ hasText: /restaurant|about/i });
      const menuOpened = await mobileMenu.isVisible();
      
      console.log(`📱 Mobile menu functionality: ${menuOpened ? '✅ WORKING' : '❌ BROKEN'}`);
    } else {
      console.log('❌ Mobile menu button not found');
    }
  });

  test('🚀 Final Production Readiness Score', async ({ page }) => {
    console.log('\n🚀 FINAL PRODUCTION DEPLOYMENT VALIDATION');
    console.log('=' + '='.repeat(55));
    
    await page.goto(PRODUCTION_URL);
    await page.waitForTimeout(3000);
    
    const checks = [];
    
    // 1. Homepage loads
    const title = await page.title();
    const hasCorrectTitle = title.toLowerCase().includes('ekaty');
    checks.push({ name: 'Homepage loads with correct title', pass: hasCorrectTitle });
    
    // 2. Basic structure
    const hasHeader = await page.locator('header').isVisible();
    const hasFooter = await page.locator('footer').isVisible();
    checks.push({ name: 'Site structure (header/footer)', pass: hasHeader && hasFooter });
    
    // 3. Critical route test - restaurants
    await page.goto(`${PRODUCTION_URL}/restaurants`);
    await page.waitForTimeout(3000);
    
    const notFound = await page.locator('text=/404|not.*found/i').count();
    const routeWorks = notFound === 0;
    checks.push({ name: '🔥 CRITICAL: /restaurants route works', pass: routeWorks });
    
    // 4. Mobile responsive
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(PRODUCTION_URL);
    await page.waitForTimeout(2000);
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const isResponsive = bodyWidth <= 380;
    checks.push({ name: 'Mobile responsive (no overflow)', pass: isResponsive });
    
    // Display results
    console.log('\n📋 PRODUCTION DEPLOYMENT CHECKLIST:');
    checks.forEach((check, index) => {
      const status = check.pass ? '✅ PASS' : '❌ FAIL';
      console.log(`   ${index + 1}. ${check.name}: ${status}`);
    });
    
    const passedChecks = checks.filter(c => c.pass).length;
    const totalChecks = checks.length;
    const deploymentScore = Math.round((passedChecks / totalChecks) * 100);
    
    console.log(`\n🎯 DEPLOYMENT SUCCESS SCORE: ${deploymentScore}%`);
    
    if (deploymentScore === 100) {
      console.log('🎉🎉 PRODUCTION DEPLOYMENT FULLY SUCCESSFUL! 🎉🎉');
      console.log('✅ All critical fixes are working on ekaty.com');
      console.log('✅ Site is ready for users');
    } else if (deploymentScore >= 75) {
      console.log('✅ Production deployment successful with minor issues');
      console.log('🔧 Some non-critical items may need attention');
    } else {
      console.log('❌ Production deployment needs more fixes');
      console.log('🚨 Critical issues still present');
    }
    
    console.log('=' + '='.repeat(55));
    
    // Must pass critical route test
    const criticalRouteCheck = checks.find(c => c.name.includes('CRITICAL'));
    expect(criticalRouteCheck?.pass).toBeTruthy();
    
    // Must have reasonable deployment score
    expect(deploymentScore).toBeGreaterThanOrEqual(75);
  });
});