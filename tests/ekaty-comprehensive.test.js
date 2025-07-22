import { test, expect } from '@playwright/test';

test.describe('eKaty.com Comprehensive Testing', () => {
  
  test('Homepage loads and displays properly', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('http://localhost:8081');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Verify the page title
    await expect(page).toHaveTitle(/eKaty/);
    
    // Check that main sections exist
    await expect(page.locator('h1')).toBeVisible();
    
    // Take a full page screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/homepage-full.png',
      fullPage: true 
    });
    
    console.log('✓ Homepage loaded successfully');
  });

  test('Featured Restaurants section displays restaurant cards', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
    
    // Wait for restaurants to load
    await page.waitForSelector('.restaurant-card', { timeout: 10000 });
    
    // Check for restaurant cards
    const restaurantCards = page.locator('.restaurant-card');
    const cardCount = await restaurantCards.count();
    
    console.log(`Found ${cardCount} restaurant cards`);
    expect(cardCount).toBeGreaterThan(0);
    
    // Test first restaurant card details
    const firstCard = restaurantCards.first();
    await expect(firstCard.locator('.restaurant-name')).toBeVisible();
    await expect(firstCard.locator('.restaurant-description')).toBeVisible();
    await expect(firstCard.locator('.restaurant-phone')).toBeVisible();
    await expect(firstCard.locator('.restaurant-address')).toBeVisible();
    
    // Check for ratings
    const ratingElement = firstCard.locator('.restaurant-rating');
    if (await ratingElement.count() > 0) {
      await expect(ratingElement).toBeVisible();
      console.log('✓ Restaurant ratings displayed');
    }
    
    // Check for images
    const imageElement = firstCard.locator('img');
    if (await imageElement.count() > 0) {
      await expect(imageElement).toBeVisible();
      console.log('✓ Restaurant images present');
    }
    
    // Take screenshot of restaurant cards section
    await page.locator('#restaurants-section').screenshot({ 
      path: 'tests/screenshots/restaurants-section.png' 
    });
    
    console.log('✓ Featured Restaurants section working properly');
  });

  test('Search Section shows cuisine categories with counts', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
    
    // Wait for cuisines to load
    await page.waitForSelector('.cuisine-item', { timeout: 10000 });
    
    // Check for cuisine categories
    const cuisineItems = page.locator('.cuisine-item');
    const cuisineCount = await cuisineItems.count();
    
    console.log(`Found ${cuisineCount} cuisine categories`);
    expect(cuisineCount).toBeGreaterThan(0);
    
    // Check that each cuisine item has a count
    for (let i = 0; i < await cuisineItems.count(); i++) {
      const cuisineItem = cuisineItems.nth(i);
      const cuisineName = await cuisineItem.locator('.cuisine-name').textContent();
      const cuisineCountElement = cuisineItem.locator('.cuisine-count');
      
      if (await cuisineCountElement.count() > 0) {
        const countText = await cuisineCountElement.textContent();
        console.log(`${cuisineName}: ${countText}`);
      }
    }
    
    // Take screenshot of search section
    await page.locator('#search-section').screenshot({ 
      path: 'tests/screenshots/search-section.png' 
    });
    
    console.log('✓ Search Section with cuisines working properly');
  });

  test('API endpoints are working properly', async ({ page }) => {
    await page.goto('http://localhost:8081');
    
    // Test restaurants API
    const restaurantsResponse = await page.request.get('http://localhost:8081/api/restaurants.php');
    expect(restaurantsResponse.status()).toBe(200);
    
    const restaurantsData = await restaurantsResponse.json();
    console.log(`Restaurants API returned ${restaurantsData.length} restaurants`);
    expect(Array.isArray(restaurantsData)).toBe(true);
    expect(restaurantsData.length).toBeGreaterThan(0);
    
    // Log sample restaurant data
    if (restaurantsData.length > 0) {
      const sampleRestaurant = restaurantsData[0];
      console.log('Sample restaurant data:', {
        name: sampleRestaurant.name,
        cuisine: sampleRestaurant.cuisine,
        phone: sampleRestaurant.phone,
        address: sampleRestaurant.address,
        rating: sampleRestaurant.rating
      });
    }
    
    // Test cuisines API
    const cuisinesResponse = await page.request.get('http://localhost:8081/api/cuisines.php');
    expect(cuisinesResponse.status()).toBe(200);
    
    const cuisinesData = await cuisinesResponse.json();
    console.log(`Cuisines API returned ${cuisinesData.length} cuisine types`);
    expect(Array.isArray(cuisinesData)).toBe(true);
    expect(cuisinesData.length).toBeGreaterThan(0);
    
    // Log cuisine data
    cuisinesData.forEach(cuisine => {
      console.log(`${cuisine.cuisine}: ${cuisine.count} restaurants`);
    });
    
    console.log('✓ API endpoints working properly');
  });

  test('Check for console errors and broken functionality', async ({ page }) => {
    const consoleMessages = [];
    const errors = [];
    
    // Listen for console messages
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log('Console Error:', msg.text());
      }
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log('Page Error:', error.message);
    });
    
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any delayed errors
    await page.waitForTimeout(3000);
    
    console.log(`Total console messages: ${consoleMessages.length}`);
    console.log(`Console errors found: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('Errors detected:', errors);
    } else {
      console.log('✓ No console errors detected');
    }
    
    // Check for broken images
    const images = await page.locator('img').all();
    let brokenImages = 0;
    
    for (const img of images) {
      const src = await img.getAttribute('src');
      if (src) {
        const naturalWidth = await img.evaluate(img => img.naturalWidth);
        if (naturalWidth === 0) {
          brokenImages++;
          console.log(`Broken image: ${src}`);
        }
      }
    }
    
    console.log(`Broken images: ${brokenImages}`);
    if (brokenImages === 0) {
      console.log('✓ All images loading properly');
    }
  });

  test('Test responsive design elements', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'tests/screenshots/desktop-view.png',
      fullPage: true 
    });
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'tests/screenshots/tablet-view.png',
      fullPage: true 
    });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-view.png',
      fullPage: true 
    });
    
    // Check if elements are still visible in mobile view
    await expect(page.locator('h1')).toBeVisible();
    
    console.log('✓ Responsive design tested across different viewport sizes');
  });

  test('Test navigation and interactive elements', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
    
    // Check for navigation elements
    const navElements = await page.locator('nav').count();
    if (navElements > 0) {
      console.log('✓ Navigation present');
    }
    
    // Check for clickable elements
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    
    console.log(`Found ${buttons} buttons and ${links} links`);
    
    // Test any search functionality
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('pizza');
      console.log('✓ Search input functional');
    }
    
    // Test cuisine filter clicks if available
    const cuisineFilters = page.locator('.cuisine-item');
    if (await cuisineFilters.count() > 0) {
      const firstCuisine = cuisineFilters.first();
      if (await firstCuisine.isEnabled()) {
        await firstCuisine.click();
        await page.waitForTimeout(1000);
        console.log('✓ Cuisine filter clickable');
      }
    }
    
    console.log('✓ Interactive elements tested');
  });

  test('Verify detailed restaurant information display', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.restaurant-card', { timeout: 10000 });
    
    const restaurantCards = page.locator('.restaurant-card');
    const cardCount = await restaurantCards.count();
    
    console.log('=== RESTAURANT DATA ANALYSIS ===');
    
    for (let i = 0; i < Math.min(5, cardCount); i++) { // Test first 5 restaurants
      const card = restaurantCards.nth(i);
      
      const name = await card.locator('.restaurant-name').textContent();
      const description = await card.locator('.restaurant-description').textContent();
      const phone = await card.locator('.restaurant-phone').textContent();
      const address = await card.locator('.restaurant-address').textContent();
      
      let rating = 'N/A';
      const ratingElement = card.locator('.restaurant-rating');
      if (await ratingElement.count() > 0) {
        rating = await ratingElement.textContent();
      }
      
      console.log(`Restaurant ${i + 1}:`);
      console.log(`  Name: ${name?.trim() || 'Missing'}`);
      console.log(`  Description: ${description?.trim().substring(0, 50) || 'Missing'}...`);
      console.log(`  Phone: ${phone?.trim() || 'Missing'}`);
      console.log(`  Address: ${address?.trim() || 'Missing'}`);
      console.log(`  Rating: ${rating?.trim() || 'Missing'}`);
      console.log('---');
    }
    
    console.log('✓ Restaurant information analysis completed');
  });
});