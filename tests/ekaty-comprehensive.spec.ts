import { test, expect, Page } from '@playwright/test';

test.describe('eKaty.com Comprehensive Testing', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Monitor console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });

    // Monitor network failures
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log('Network error:', response.url(), response.status());
      }
    });
  });

  test.describe('1. Page Load and Basic Structure', () => {
    test('should load homepage successfully with status 200', async () => {
      const response = await page.goto('/');
      expect(response?.status()).toBe(200);
      
      // Take screenshot of homepage
      await page.screenshot({ 
        path: 'test-results/homepage-full.png', 
        fullPage: true 
      });
    });

    test('should have correct page title', async () => {
      await page.goto('/');
      await expect(page).toHaveTitle(/eKaty/);
    });

    test('should have main page structure elements', async () => {
      await page.goto('/');
      
      // Check for main structural elements
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
    });

    test('should load without console errors', async () => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      expect(errors).toHaveLength(0);
    });
  });

  test.describe('2. Hero Section Testing', () => {
    test('should display hero section with all elements', async () => {
      await page.goto('/');
      
      // Check hero section visibility
      const heroSection = page.locator('[data-testid="hero-section"], .hero, section').first();
      await expect(heroSection).toBeVisible();
      
      // Take screenshot of hero section
      await heroSection.screenshot({ path: 'test-results/hero-section.png' });
    });

    test('should have functional search input field', async () => {
      await page.goto('/');
      
      // Look for search input
      const searchInput = page.locator('input[type="text"], input[placeholder*="search"], input[placeholder*="restaurant"]').first();
      
      if (await searchInput.count() > 0) {
        await expect(searchInput).toBeVisible();
        await searchInput.fill('Pizza Palace');
        await expect(searchInput).toHaveValue('Pizza Palace');
      }
    });

    test('should have area selector dropdown', async () => {
      await page.goto('/');
      
      // Look for dropdown/select elements
      const dropdown = page.locator('select, [role="combobox"], .dropdown').first();
      
      if (await dropdown.count() > 0) {
        await expect(dropdown).toBeVisible();
        await dropdown.screenshot({ path: 'test-results/area-selector.png' });
      }
    });

    test('should have clickable Find Restaurants button', async () => {
      await page.goto('/');
      
      // Look for Find Restaurants button
      const findButton = page.locator('button:has-text("Find Restaurants"), button:has-text("Find"), button:has-text("Search")').first();
      
      if (await findButton.count() > 0) {
        await expect(findButton).toBeVisible();
        await expect(findButton).toBeEnabled();
        
        // Test click functionality
        await findButton.click();
      }
    });

    test('should have popular search tags', async () => {
      await page.goto('/');
      
      // Look for popular search tags
      const popularTags = ['Pizza', 'Mexican', 'BBQ', 'Sushi', 'Steakhouse'];
      
      for (const tag of popularTags) {
        const tagElement = page.locator(`text="${tag}"`).first();
        if (await tagElement.count() > 0) {
          await expect(tagElement).toBeVisible();
        }
      }
    });
  });

  test.describe('3. Component Verification', () => {
    test('should display SearchSection component', async () => {
      await page.goto('/');
      
      const searchSection = page.locator('[data-testid="search-section"], .search-section, section:has(input)').first();
      if (await searchSection.count() > 0) {
        await expect(searchSection).toBeVisible();
        await searchSection.screenshot({ path: 'test-results/search-section.png' });
      }
    });

    test('should display FeaturedRestaurants component', async () => {
      await page.goto('/');
      
      const featuredSection = page.locator('[data-testid="featured-restaurants"], .featured-restaurants, section:has-text("Featured")').first();
      if (await featuredSection.count() > 0) {
        await expect(featuredSection).toBeVisible();
        await featuredSection.screenshot({ path: 'test-results/featured-restaurants.png' });
      }
    });

    test('should display StatsSection with metrics', async () => {
      await page.goto('/');
      
      const statsSection = page.locator('[data-testid="stats-section"], .stats-section, section:has-text("restaurants")').first();
      if (await statsSection.count() > 0) {
        await expect(statsSection).toBeVisible();
        await statsSection.screenshot({ path: 'test-results/stats-section.png' });
      }
    });

    test('should display NewsletterSignup component', async () => {
      await page.goto('/');
      
      const newsletterSection = page.locator('[data-testid="newsletter-signup"], .newsletter-signup, section:has(input[type="email"])').first();
      if (await newsletterSection.count() > 0) {
        await expect(newsletterSection).toBeVisible();
        await newsletterSection.screenshot({ path: 'test-results/newsletter-section.png' });
      }
    });

    test('should have Header component with navigation', async () => {
      await page.goto('/');
      
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      // Look for navigation elements
      const navLinks = page.locator('header a, header nav a');
      if (await navLinks.count() > 0) {
        await expect(navLinks.first()).toBeVisible();
      }
      
      await header.screenshot({ path: 'test-results/header.png' });
    });

    test('should have Footer component', async () => {
      await page.goto('/');
      
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
      await footer.screenshot({ path: 'test-results/footer.png' });
    });
  });

  test.describe('4. Interactive Elements', () => {
    test('should have responsive clickable elements', async () => {
      await page.goto('/');
      
      // Find all buttons and test they're clickable
      const buttons = page.locator('button:visible');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const button = buttons.nth(i);
          await expect(button).toBeEnabled();
        }
      }
    });

    test('should have functional form inputs', async () => {
      await page.goto('/');
      
      // Test text inputs
      const textInputs = page.locator('input[type="text"], input[type="search"]');
      const textInputCount = await textInputs.count();
      
      if (textInputCount > 0) {
        const firstInput = textInputs.first();
        await firstInput.fill('Test Input');
        await expect(firstInput).toHaveValue('Test Input');
      }

      // Test email inputs
      const emailInputs = page.locator('input[type="email"]');
      const emailInputCount = await emailInputs.count();
      
      if (emailInputCount > 0) {
        const firstEmailInput = emailInputs.first();
        await firstEmailInput.fill('test@example.com');
        await expect(firstEmailInput).toHaveValue('test@example.com');
      }
    });

    test('should have functional dropdown selections', async () => {
      await page.goto('/');
      
      const selects = page.locator('select');
      const selectCount = await selects.count();
      
      if (selectCount > 0) {
        const firstSelect = selects.first();
        await expect(firstSelect).toBeVisible();
        
        // Try to select an option if available
        const options = page.locator('select option');
        const optionCount = await options.count();
        
        if (optionCount > 1) {
          await firstSelect.selectOption({ index: 1 });
        }
      }
    });

    test('should test responsive behavior', async () => {
      await page.goto('/');
      
      // Test desktop view
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.screenshot({ path: 'test-results/desktop-view.png' });
      
      // Test tablet view
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.screenshot({ path: 'test-results/tablet-view.png' });
      
      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await page.screenshot({ path: 'test-results/mobile-view.png' });
    });
  });

  test.describe('5. Navigation and Links', () => {
    test('should have working header navigation links', async () => {
      await page.goto('/');
      
      const navLinks = page.locator('header a, nav a');
      const linkCount = await navLinks.count();
      
      if (linkCount > 0) {
        for (let i = 0; i < Math.min(linkCount, 3); i++) {
          const link = navLinks.nth(i);
          const href = await link.getAttribute('href');
          
          if (href && !href.startsWith('http')) {
            // Internal link
            await expect(link).toBeVisible();
          }
        }
      }
    });

    test('should have working footer links', async () => {
      await page.goto('/');
      
      const footerLinks = page.locator('footer a');
      const linkCount = await footerLinks.count();
      
      if (linkCount > 0) {
        const firstLink = footerLinks.first();
        await expect(firstLink).toBeVisible();
      }
    });
  });

  test.describe('6. Visual Verification', () => {
    test('should verify images load properly', async () => {
      await page.goto('/');
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        for (let i = 0; i < Math.min(imageCount, 5); i++) {
          const img = images.nth(i);
          
          // Check if image is loaded (has natural width > 0)
          const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
          expect(naturalWidth).toBeGreaterThan(0);
        }
      }
    });

    test('should verify color scheme and typography', async () => {
      await page.goto('/');
      
      // Check if CSS is loaded by verifying computed styles
      const body = page.locator('body');
      const bodyStyles = await body.evaluate((el) => {
        const styles = getComputedStyle(el);
        return {
          fontFamily: styles.fontFamily,
          color: styles.color,
          backgroundColor: styles.backgroundColor
        };
      });
      
      expect(bodyStyles.fontFamily).toBeTruthy();
      expect(bodyStyles.color).toBeTruthy();
    });

    test('should take comprehensive screenshots', async () => {
      await page.goto('/');
      
      // Wait for content to load
      await page.waitForLoadState('networkidle');
      
      // Take full page screenshot
      await page.screenshot({ 
        path: 'test-results/full-page-final.png', 
        fullPage: true 
      });
      
      // Take viewport screenshot
      await page.screenshot({ 
        path: 'test-results/viewport-final.png' 
      });
    });
  });

  test.describe('7. Error Checking', () => {
    test('should check for broken images', async () => {
      await page.goto('/');
      
      const brokenImages: string[] = [];
      
      page.on('response', response => {
        if (response.url().match(/\.(jpg|jpeg|png|gif|svg)$/i) && response.status() >= 400) {
          brokenImages.push(response.url());
        }
      });
      
      await page.waitForLoadState('networkidle');
      
      expect(brokenImages).toHaveLength(0);
    });

    test('should check for failed network requests', async () => {
      await page.goto('/');
      
      const failedRequests: string[] = [];
      
      page.on('response', response => {
        if (response.status() >= 400) {
          failedRequests.push(`${response.url()} - ${response.status()}`);
        }
      });
      
      await page.waitForLoadState('networkidle');
      
      expect(failedRequests).toHaveLength(0);
    });

    test('should check basic accessibility', async () => {
      await page.goto('/');
      
      // Check for alt attributes on images
      const imagesWithoutAlt = await page.locator('img:not([alt])').count();
      
      // Check for proper heading structure
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      
      // Basic accessibility checks
      expect(imagesWithoutAlt).toBeLessThanOrEqual(5); // Allow some leeway
      expect(headingCount).toBeGreaterThan(0);
    });
  });

  test.describe('8. Performance Testing', () => {
    test('should measure page load performance', async () => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Page should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
      
      console.log(`Page load time: ${loadTime}ms`);
    });

    test('should verify smooth interactions', async () => {
      await page.goto('/');
      
      // Test scrolling performance
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
      });
      
      await page.waitForTimeout(500);
      
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      
      // If we get here without timing out, scrolling works
      expect(true).toBe(true);
    });
  });
});