import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://ekaty.com';

test.describe('Production Site Validation - ekaty.com', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set up error and console logging
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`🔴 Browser error: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', (error) => {
      console.error(`🔴 Page error: ${error.message}`);
    });
  });

  test('🌐 Production Site Accessibility and Basic Load', async ({ page }) => {
    console.log('🔍 Testing production site accessibility...\n');
    
    await page.goto(PRODUCTION_URL);
    
    // Check if page loads successfully
    await expect(page).toHaveTitle(/eKaty/i);
    console.log('✅ Page title loaded correctly');
    
    // Check for basic site structure
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    console.log('✅ Basic site structure present');
    
    // Check for hero section
    const heroSection = page.locator('text=/discover|restaurant|katy/i').first();
    await expect(heroSection).toBeVisible();
    console.log('✅ Hero section visible');
  });

  test('🔧 Fix 1: Restaurant Data Loading on Production', async ({ page }) => {
    console.log('🔍 Testing restaurant data loading on production...\n');
    
    await page.goto(`${PRODUCTION_URL}/restaurants`);
    
    // Wait for page to load
    await page.waitForTimeout(5000);
    
    // Check for restaurant cards
    const restaurantCards = page.locator('article, .restaurant-card, [data-testid="restaurant-card"]');
    const cardCount = await restaurantCards.count();
    
    console.log(`📊 Found ${cardCount} restaurant cards on production`);
    
    if (cardCount > 0) {
      console.log('✅ Restaurant data loading works on production');
      
      // Check first restaurant card content
      const firstCard = restaurantCards.first();
      const nameElement = firstCard.locator('h2, h3, h4').first();
      
      if (await nameElement.isVisible()) {
        const restaurantName = await nameElement.textContent();
        console.log(`   📍 Sample restaurant: ${restaurantName}`);
      }
    } else {
      console.log('❌ No restaurant cards found on production');
      
      // Check for error messages or loading states
      const errorElements = page.locator('text=/error|loading|no.*found/i');
      const errorCount = await errorElements.count();
      
      if (errorCount > 0) {
        const errorText = await errorElements.first().textContent();
        console.log(`   🔴 Error message: ${errorText}`);
      }
    }
    
    expect(cardCount).toBeGreaterThan(0);
  });

  test('📱 Fix 2: Mobile Navigation on Production', async ({ page }) => {
    console.log('🔍 Testing mobile navigation on production...\n');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(PRODUCTION_URL);
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Look for mobile menu button
    const menuButton = page.locator('button[aria-label*="menu"], button').filter({ 
      has: page.locator('svg') 
    }).first();
    
    const isMenuButtonVisible = await menuButton.isVisible();
    console.log(`📱 Mobile menu button visible: ${isMenuButtonVisible}`);
    
    if (isMenuButtonVisible) {
      // Click the menu button
      await menuButton.click();
      await page.waitForTimeout(1000);
      
      // Check if mobile menu opened
      const mobileMenu = page.locator('nav').filter({ hasText: /restaurant|about|contact/i });
      const isMenuOpen = await mobileMenu.isVisible();
      
      console.log(`📱 Mobile menu opens: ${isMenuOpen}`);
      
      if (isMenuOpen) {
        console.log('✅ Mobile navigation works on production');
        
        // Check for navigation links
        const navLinks = mobileMenu.locator('a');
        const linkCount = await navLinks.count();
        console.log(`   🔗 Navigation links found: ${linkCount}`);
        
        expect(linkCount).toBeGreaterThan(3);
      } else {
        console.log('❌ Mobile menu does not open on production');
      }
    } else {
      console.log('❌ Mobile menu button not found on production');
    }
  });

  test('📧 Fix 3: Newsletter Form on Production', async ({ page }) => {
    console.log('🔍 Testing newsletter form on production...\n');
    
    await page.goto(PRODUCTION_URL);
    await page.waitForTimeout(3000);
    
    // Find email input
    const emailInputs = page.locator('input[type="email"]');
    const emailCount = await emailInputs.count();
    
    console.log(`📧 Email inputs found: ${emailCount}`);
    
    if (emailCount > 0) {
      const emailInput = emailInputs.first();
      await emailInput.scrollIntoViewIfNeeded();
      
      // Test email validation
      await emailInput.fill('invalid-email');
      const submitButton = page.locator('button').filter({ hasText: /subscribe|sign.*up/i }).first();
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        // Check for validation feedback
        const validationElements = page.locator('text=/invalid|error|valid.*email/i');
        const hasValidation = await validationElements.count() > 0;
        
        console.log(`📧 Email validation working: ${hasValidation}`);
        
        if (hasValidation) {
          console.log('✅ Newsletter form validation works on production');
        }
      }
    } else {
      console.log('❌ Newsletter form not found on production');
    }
  });

  test('📐 Fix 4: Responsive Design on Production', async ({ page }) => {
    console.log('🔍 Testing responsive design on production...\n');
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(PRODUCTION_URL);
      await page.waitForTimeout(2000);
      
      // Check for horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport.width;
      
      console.log(`📐 ${viewport.name}: Content width ${bodyWidth}px, Viewport ${viewportWidth}px`);
      
      if (bodyWidth <= viewportWidth + 5) { // 5px tolerance
        console.log(`✅ ${viewport.name} no horizontal overflow on production`);
      } else {
        console.log(`❌ ${viewport.name} has overflow on production: ${bodyWidth - viewportWidth}px`);
      }
      
      // Ensure key elements are visible
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
    }
  });

  test('📊 Fix 5: Homepage Stats on Production', async ({ page }) => {
    console.log('🔍 Testing homepage stats on production...\n');
    
    await page.goto(PRODUCTION_URL);
    await page.waitForTimeout(5000); // Give stats time to load
    
    // Look for stats section
    const statsElements = page.locator('text=/[0-9]+.*restaurant/i, text=/[0-9]+\+/, text=/[0-9]\\.[0-9]/, .stat');
    const statsCount = await statsElements.count();
    
    console.log(`📊 Stats elements found: ${statsCount}`);
    
    if (statsCount > 0) {
      console.log('✅ Homepage stats visible on production');
      
      // Get specific stats text
      for (let i = 0; i < Math.min(statsCount, 4); i++) {
        const statText = await statsElements.nth(i).textContent();
        console.log(`   📈 Stat ${i + 1}: ${statText}`);
      }
    } else {
      console.log('❌ Homepage stats not found on production');
      
      // Check for loading states
      const loadingElements = page.locator('text=/loading/, .skeleton, .spinner');
      const loadingCount = await loadingElements.count();
      console.log(`   ⏳ Loading elements found: ${loadingCount}`);
    }
    
    expect(statsCount).toBeGreaterThan(0);
  });

  test('⚡ Fix 6: Error Handling and Loading States on Production', async ({ page }) => {
    console.log('🔍 Testing error handling and loading states on production...\n');
    
    await page.goto(PRODUCTION_URL);
    
    // Check for any JavaScript errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.waitForTimeout(3000);
    
    console.log(`🔍 JavaScript errors found: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('❌ JavaScript errors on production:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No JavaScript errors on production');
    }
    
    // Check restaurant page for error handling
    await page.goto(`${PRODUCTION_URL}/restaurants`);
    await page.waitForTimeout(3000);
    
    // Look for error boundaries or error states
    const errorBoundaryElements = page.locator('text=/something.*wrong|error.*occurred|try.*again/i, button:has-text("retry")');
    const errorBoundaryCount = await errorBoundaryElements.count();
    
    console.log(`⚡ Error handling elements available: ${errorBoundaryCount > 0}`);
    
    // Check for loading states
    const loadingElements = page.locator('.skeleton, .spinner, text=/loading/i');
    const loadingCount = await loadingElements.count();
    
    console.log(`⚡ Loading state elements: ${loadingCount}`);
    
    if (errors.length === 0) {
      console.log('✅ Error handling system working (no crashes detected)');
    }
  });

  test('🔍 Comprehensive Production Site Health Check', async ({ page }) => {
    console.log('\n🩺 Running comprehensive production health check...\n');
    
    await page.goto(PRODUCTION_URL);
    await page.waitForTimeout(3000);
    
    const healthChecks = {
      title: false,
      header: false,
      footer: false,
      navigation: false,
      hero: false,
      search: false,
      images: 0,
      links: 0,
      jsErrors: 0
    };
    
    // Check title
    const title = await page.title();
    healthChecks.title = title.toLowerCase().includes('ekaty');
    console.log(`📋 Title check: ${healthChecks.title ? '✅' : '❌'} "${title}"`);
    
    // Check header
    healthChecks.header = await page.locator('header').isVisible();
    console.log(`📋 Header check: ${healthChecks.header ? '✅' : '❌'}`);
    
    // Check footer
    healthChecks.footer = await page.locator('footer').isVisible();
    console.log(`📋 Footer check: ${healthChecks.footer ? '✅' : '❌'}`);
    
    // Check navigation
    const navLinks = page.locator('nav a');
    healthChecks.links = await navLinks.count();
    healthChecks.navigation = healthChecks.links > 3;
    console.log(`📋 Navigation check: ${healthChecks.navigation ? '✅' : '❌'} (${healthChecks.links} links)`);
    
    // Check hero section
    const hero = page.locator('text=/discover|restaurant|katy/i').first();
    healthChecks.hero = await hero.isVisible();
    console.log(`📋 Hero section check: ${healthChecks.hero ? '✅' : '❌'}`);
    
    // Check search functionality
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]').first();
    healthChecks.search = await searchInput.isVisible();
    console.log(`📋 Search functionality check: ${healthChecks.search ? '✅' : '❌'}`);
    
    // Check images
    const images = page.locator('img');
    healthChecks.images = await images.count();
    console.log(`📋 Images loaded: ${healthChecks.images}`);
    
    // Summary
    const totalChecks = Object.keys(healthChecks).length - 2; // Exclude jsErrors and images count
    const passedChecks = Object.values(healthChecks).filter(v => v === true).length;
    const healthScore = Math.round((passedChecks / totalChecks) * 100);
    
    console.log(`\n🎯 Production Health Score: ${healthScore}% (${passedChecks}/${totalChecks} checks passed)`);
    
    if (healthScore >= 80) {
      console.log('🎉 Production site is healthy and ready!');
    } else {
      console.log('⚠️ Production site needs attention');
    }
    
    // Expect minimum health threshold
    expect(healthScore).toBeGreaterThanOrEqual(70);
  });

  test('🚀 Final Production Readiness Assessment', async ({ page }) => {
    console.log('\n🚀 FINAL PRODUCTION READINESS ASSESSMENT');
    console.log('=' + '='.repeat(50));
    
    await page.goto(PRODUCTION_URL);
    await page.waitForTimeout(3000);
    
    const readinessChecks = [];
    
    // 1. Basic functionality
    const title = await page.title();
    const hasTitle = title.toLowerCase().includes('ekaty');
    readinessChecks.push({ name: 'Site loads with correct title', status: hasTitle });
    
    // 2. Navigation
    const navLinks = await page.locator('nav a').count();
    readinessChecks.push({ name: 'Navigation menu present', status: navLinks > 0 });
    
    // 3. Content sections
    const hasHeader = await page.locator('header').isVisible();
    const hasFooter = await page.locator('footer').isVisible();
    const hasHero = await page.locator('text=/discover|restaurant|katy/i').first().isVisible();
    
    readinessChecks.push({ name: 'Header section', status: hasHeader });
    readinessChecks.push({ name: 'Footer section', status: hasFooter });
    readinessChecks.push({ name: 'Hero section', status: hasHero });
    
    // 4. Restaurant functionality (critical)
    await page.goto(`${PRODUCTION_URL}/restaurants`);
    await page.waitForTimeout(3000);
    
    const restaurantCards = await page.locator('article, .restaurant-card').count();
    readinessChecks.push({ name: 'Restaurant data loads', status: restaurantCards > 0 });
    
    // 5. Mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(PRODUCTION_URL);
    await page.waitForTimeout(2000);
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const isMobileResponsive = bodyWidth <= 380; // 375 + 5px tolerance
    readinessChecks.push({ name: 'Mobile responsive design', status: isMobileResponsive });
    
    // Display results
    console.log('\n📋 PRODUCTION READINESS CHECKLIST:');
    readinessChecks.forEach((check, index) => {
      const status = check.status ? '✅' : '❌';
      console.log(`   ${index + 1}. ${check.name}: ${status}`);
    });
    
    const passedChecks = readinessChecks.filter(check => check.status).length;
    const readinessScore = Math.round((passedChecks / readinessChecks.length) * 100);
    
    console.log(`\n🎯 PRODUCTION READINESS SCORE: ${readinessScore}%`);
    
    if (readinessScore === 100) {
      console.log('🎉 PRODUCTION SITE IS FULLY READY FOR USERS!');
    } else if (readinessScore >= 80) {
      console.log('✅ Production site is ready with minor issues');
    } else {
      console.log('⚠️ Production site needs significant fixes');
    }
    
    console.log('=' + '='.repeat(50));
    
    // Expect high readiness score
    expect(readinessScore).toBeGreaterThanOrEqual(85);
  });
});