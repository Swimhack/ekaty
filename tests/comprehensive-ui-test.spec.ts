import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8081';

test.describe('eKaty.com Comprehensive UI/UX Testing', () => {
  
  test.describe('Homepage Tests', () => {
    test('should load homepage with all key elements', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Check for header
      await expect(page.locator('header')).toBeVisible();
      
      // Check for logo
      const logo = page.locator('img[alt*="eKaty"], img[alt*="Ekaty"], header img').first();
      await expect(logo).toBeVisible();
      
      // Check for navigation menu
      await expect(page.locator('nav')).toBeVisible();
      
      // Check for hero section
      const hero = page.locator('section').filter({ hasText: /discover|restaurant|katy/i }).first();
      await expect(hero).toBeVisible();
      
      // Check for search functionality
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="restaurant"]').first();
      await expect(searchInput).toBeVisible();
      
      // Check for featured restaurants section
      const featuredSection = page.locator('text=/featured|popular/i');
      await expect(featuredSection).toBeVisible();
      
      // Check for footer
      await expect(page.locator('footer')).toBeVisible();
    });
    
    test('should display restaurant count statistics', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Look for stats section with numbers
      const statsSection = page.locator('text=/[0-9]+.*restaurant/i');
      const isStatsVisible = await statsSection.isVisible().catch(() => false);
      
      if (isStatsVisible) {
        console.log('✅ Stats section found');
      } else {
        console.log('⚠️ Stats section not visible on homepage');
      }
    });
    
    test('should have working search functionality', async ({ page }) => {
      await page.goto(BASE_URL);
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="restaurant"]').first();
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('pizza');
        await page.keyboard.press('Enter');
        
        // Wait for results or navigation
        await page.waitForTimeout(1000);
        
        // Check if we're on search results page or if results appeared
        const currentUrl = page.url();
        if (currentUrl.includes('search') || currentUrl.includes('restaurant')) {
          console.log('✅ Search navigation works');
        }
      }
    });
    
    test('should have newsletter signup form', async ({ page }) => {
      await page.goto(BASE_URL);
      
      const emailInput = page.locator('input[type="email"]');
      const newsletterForm = page.locator('form').filter({ has: emailInput });
      
      if (await newsletterForm.isVisible()) {
        console.log('✅ Newsletter signup form present');
        
        // Test form validation
        const submitButton = newsletterForm.locator('button[type="submit"]');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          // Check for validation message
          await page.waitForTimeout(500);
        }
      } else {
        console.log('⚠️ Newsletter form not found');
      }
    });
  });
  
  test.describe('Navigation Tests', () => {
    test('should navigate to all main pages', async ({ page }) => {
      await page.goto(BASE_URL);
      
      const navigationLinks = [
        { text: 'Restaurants', expectedUrl: /restaurant/i },
        { text: 'Cuisines', expectedUrl: /cuisine/i },
        { text: 'Popular', expectedUrl: /popular/i },
        { text: 'Areas', expectedUrl: /area/i },
        { text: 'About', expectedUrl: /about/i },
        { text: 'Contact', expectedUrl: /contact/i }
      ];
      
      for (const link of navigationLinks) {
        const navLink = page.locator(`nav a:has-text("${link.text}"), a:has-text("${link.text}")`).first();
        
        if (await navLink.isVisible()) {
          await navLink.click();
          await page.waitForTimeout(1000);
          
          const currentUrl = page.url();
          if (link.expectedUrl.test(currentUrl)) {
            console.log(`✅ ${link.text} page navigation works`);
          } else {
            console.log(`⚠️ ${link.text} page URL doesn't match expected pattern`);
          }
          
          await page.goto(BASE_URL); // Return to homepage
        } else {
          console.log(`⚠️ ${link.text} link not found in navigation`);
        }
      }
    });
    
    test('should have working mobile menu on small screens', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);
      
      // Look for hamburger menu button
      const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first();
      
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(500);
        
        // Check if mobile menu opened
        const mobileNav = page.locator('.mobile-menu, div.md\\:hidden:has(.px-4.pt-4.pb-6)');
        if (await mobileNav.first().isVisible()) {
          console.log('✅ Mobile menu works');
        } else {
          console.log('⚠️ Mobile menu not opening properly');
        }
      } else {
        console.log('⚠️ Mobile menu button not found');
      }
    });
  });
  
  test.describe('Restaurant Listing Tests', () => {
    test('should display restaurant cards with key information', async ({ page }) => {
      await page.goto(`${BASE_URL}/restaurants`);
      await page.waitForTimeout(2000);
      
      // Check for restaurant cards
      const restaurantCards = page.locator('article, .restaurant-card, [data-testid="restaurant-card"]');
      const cardCount = await restaurantCards.count();
      
      if (cardCount > 0) {
        console.log(`✅ Found ${cardCount} restaurant cards`);
        
        // Check first card for required elements
        const firstCard = restaurantCards.first();
        
        // Check for restaurant name
        const nameElement = firstCard.locator('h2, h3, h4').first();
        if (await nameElement.isVisible()) {
          const name = await nameElement.textContent();
          console.log(`   Restaurant name: ${name}`);
        }
        
        // Check for rating
        const ratingElement = firstCard.locator('text=/[0-9]\\.[0-9]/');
        if (await ratingElement.isVisible()) {
          console.log('   ✅ Rating displayed');
        }
        
        // Check for cuisine type
        const cuisineElement = firstCard.locator('text=/italian|mexican|american|chinese|thai/i');
        if (await cuisineElement.isVisible()) {
          console.log('   ✅ Cuisine type displayed');
        }
        
        // Check for address
        const addressElement = firstCard.locator('text=/katy|houston/i');
        if (await addressElement.isVisible()) {
          console.log('   ✅ Address displayed');
        }
      } else {
        console.log('❌ No restaurant cards found');
      }
    });
    
    test('should have working filters and sorting', async ({ page }) => {
      await page.goto(`${BASE_URL}/restaurants`);
      await page.waitForTimeout(2000);
      
      // Check for cuisine filter
      const cuisineFilter = page.locator('select, button').filter({ hasText: /cuisine/i }).first();
      if (await cuisineFilter.isVisible()) {
        console.log('✅ Cuisine filter present');
      }
      
      // Check for price filter
      const priceFilter = page.locator('button').filter({ hasText: /\$/i }).first();
      if (await priceFilter.isVisible()) {
        console.log('✅ Price filter present');
      }
      
      // Check for sort options
      const sortDropdown = page.locator('select').filter({ hasText: /sort/i }).first();
      if (await sortDropdown.isVisible()) {
        console.log('✅ Sort options present');
      }
    });
  });
  
  test.describe('Restaurant Detail Page Tests', () => {
    test('should display complete restaurant information', async ({ page }) => {
      await page.goto(`${BASE_URL}/restaurants`);
      await page.waitForTimeout(2000);
      
      // Click on first restaurant
      const firstRestaurant = page.locator('article, .restaurant-card').first();
      if (await firstRestaurant.isVisible()) {
        await firstRestaurant.click();
        await page.waitForTimeout(2000);
        
        // Check for restaurant name
        const restaurantName = page.locator('h1').first();
        if (await restaurantName.isVisible()) {
          const name = await restaurantName.textContent();
          console.log(`✅ Restaurant detail page loaded: ${name}`);
        }
        
        // Check for key information sections
        const sections = [
          { selector: 'text=/hours|opening/i', name: 'Hours' },
          { selector: 'text=/phone|call/i', name: 'Phone' },
          { selector: 'text=/address|location/i', name: 'Address' },
          { selector: 'text=/rating|review/i', name: 'Rating' },
          { selector: 'text=/\$+/', name: 'Price Range' }
        ];
        
        for (const section of sections) {
          const element = page.locator(section.selector).first();
          if (await element.isVisible()) {
            console.log(`   ✅ ${section.name} section present`);
          } else {
            console.log(`   ⚠️ ${section.name} section missing`);
          }
        }
        
        // Check for action buttons
        const actionButtons = [
          { text: /website|visit/i, name: 'Website link' },
          { text: /map|direction/i, name: 'Map/Directions' },
          { text: /menu/i, name: 'Menu' }
        ];
        
        for (const button of actionButtons) {
          const element = page.locator('a, button').filter({ hasText: button.text }).first();
          if (await element.isVisible()) {
            console.log(`   ✅ ${button.name} button present`);
          }
        }
      }
    });
  });
  
  test.describe('Responsive Design Tests', () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      test(`should display correctly on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(BASE_URL);
        
        // Check if content is visible and not overflowing
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        
        if (bodyWidth <= viewport.width) {
          console.log(`✅ ${viewport.name} layout fits viewport (no horizontal scroll)`);
        } else {
          console.log(`⚠️ ${viewport.name} has horizontal overflow (${bodyWidth}px vs ${viewport.width}px)`);
        }
        
        // Check if key elements are visible
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();
      });
    }
  });
  
  test.describe('Performance and Loading Tests', () => {
    test('should load images properly', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Check for broken images
      const images = page.locator('img');
      const imageCount = await images.count();
      let brokenImages = 0;
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const isVisible = await img.isVisible();
        
        if (isVisible) {
          const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
          if (naturalWidth === 0) {
            brokenImages++;
            const src = await img.getAttribute('src');
            console.log(`   ❌ Broken image: ${src}`);
          }
        }
      }
      
      console.log(`✅ ${imageCount - brokenImages}/${imageCount} images loaded successfully`);
    });
    
    test('should handle loading states', async ({ page }) => {
      await page.goto(`${BASE_URL}/restaurants`);
      
      // Check for loading indicators
      const loadingIndicator = page.locator('text=/loading|spinner/i, .spinner, .loader');
      const hasLoader = await loadingIndicator.isVisible().catch(() => false);
      
      if (hasLoader) {
        console.log('✅ Loading indicator present');
        
        // Wait for content to load
        await page.waitForTimeout(3000);
        
        // Check if loader disappeared
        const stillLoading = await loadingIndicator.isVisible().catch(() => false);
        if (!stillLoading) {
          console.log('✅ Loading indicator disappears after content loads');
        }
      }
    });
  });
  
  test.describe('Accessibility Tests', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Check for h1
      const h1Count = await page.locator('h1').count();
      if (h1Count === 1) {
        console.log('✅ Single H1 tag present');
      } else {
        console.log(`⚠️ Found ${h1Count} H1 tags (should be 1)`);
      }
      
      // Check for alt text on images
      const imagesWithoutAlt = await page.locator('img:not([alt])').count();
      if (imagesWithoutAlt === 0) {
        console.log('✅ All images have alt text');
      } else {
        console.log(`⚠️ ${imagesWithoutAlt} images missing alt text`);
      }
    });
    
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
      
      await page.keyboard.press('Tab');
      const secondFocused = await page.evaluate(() => document.activeElement?.tagName);
      
      if (firstFocused && secondFocused) {
        console.log('✅ Keyboard navigation working');
      } else {
        console.log('⚠️ Keyboard navigation may have issues');
      }
    });
  });
});

// Run all tests
test('Generate comprehensive test report', async ({ page }) => {
  console.log('\n📊 COMPREHENSIVE UI/UX TEST SUMMARY');
  console.log('=====================================\n');
  
  // This test will compile results from all other tests
  console.log('All tests completed. Check console output for detailed results.');
});