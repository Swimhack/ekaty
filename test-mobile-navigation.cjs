const { chromium } = require('playwright');

async function testMobileNavigation() {
  console.log('🔬 Testing Mobile Navigation Fix...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const page = await context.newPage();
  
  try {
    // Navigate to the homepage
    console.log('📱 Setting mobile viewport (375x667)...');
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the initial mobile view
    await page.screenshot({ path: 'mobile-nav-before.png', fullPage: false });
    console.log('✅ Initial mobile view captured');
    
    // Find the mobile menu button
    console.log('🔍 Looking for mobile menu button...');
    const menuButton = page.locator('button[aria-label*="menu" i], button[aria-expanded]');
    
    // Verify menu button is visible on mobile
    const isMenuButtonVisible = await menuButton.isVisible();
    if (isMenuButtonVisible) {
      console.log('✅ Mobile menu button found and visible');
      
      // Check aria attributes
      const ariaLabel = await menuButton.getAttribute('aria-label');
      const ariaExpanded = await menuButton.getAttribute('aria-expanded');
      console.log(`   Aria-label: "${ariaLabel}"`);
      console.log(`   Aria-expanded: "${ariaExpanded}"`);
      
      // Click the menu button to open mobile menu
      console.log('🖱️  Clicking mobile menu button...');
      await menuButton.click();
      await page.waitForTimeout(500); // Wait for animation
      
      // Take screenshot of opened menu
      await page.screenshot({ path: 'mobile-nav-opened.png', fullPage: false });
      
      // Check if mobile navigation menu appeared
      const mobileNav = page.locator('div.md\\:hidden').locator('.px-4.pt-4.pb-6');
      const isNavVisible = await mobileNav.isVisible();
      
      if (isNavVisible) {
        console.log('✅ Mobile navigation menu opened successfully!');
        
        // Count navigation links
        const navLinks = mobileNav.locator('a');
        const linkCount = await navLinks.count();
        console.log(`   Found ${linkCount} navigation links`);
        
        // Test each navigation link
        for (let i = 0; i < linkCount && i < 7; i++) {
          const link = navLinks.nth(i);
          const linkText = await link.textContent();
          const isLinkVisible = await link.isVisible();
          const isLinkClickable = await link.isEnabled();
          
          console.log(`   Link ${i + 1}: "${linkText?.trim()}" - Visible: ${isLinkVisible}, Clickable: ${isLinkClickable}`);
        }
        
        // Test clicking a navigation link
        console.log('🖱️  Testing navigation link click...');
        const firstNavLink = navLinks.first();
        const linkText = await firstNavLink.textContent();
        await firstNavLink.click();
        await page.waitForTimeout(1000);
        
        // Check if menu closed after navigation
        const isMenuStillOpen = await mobileNav.isVisible().catch(() => false);
        if (!isMenuStillOpen) {
          console.log(`✅ Menu closed after clicking "${linkText?.trim()}" link`);
        } else {
          console.log('⚠️  Menu did not close after navigation');
        }
        
        // Test menu button again
        await menuButton.click();
        await page.waitForTimeout(500);
        
        // Test clicking outside to close menu
        console.log('🖱️  Testing click outside to close menu...');
        // Click on the backdrop/overlay area
        await page.locator('div.fixed.inset-0.bg-black\\/20').click();
        await page.waitForTimeout(500);
        
        const isMenuClosed = !(await mobileNav.isVisible().catch(() => true));
        if (isMenuClosed) {
          console.log('✅ Menu closes when clicking outside');
        } else {
          console.log('⚠️  Menu does not close when clicking outside');
        }
        
      } else {
        console.log('❌ Mobile navigation menu did not open');
      }
      
    } else {
      console.log('❌ Mobile menu button not found or not visible');
    }
    
    // Test different mobile viewport sizes
    const viewports = [
      { width: 320, height: 568, name: 'iPhone 5/SE' },
      { width: 375, height: 812, name: 'iPhone X/11' },
      { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
      { width: 360, height: 640, name: 'Android Small' },
      { width: 768, height: 1024, name: 'iPad' }
    ];
    
    console.log('\n📐 Testing different mobile viewport sizes...');
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:8081');
      await page.waitForLoadState('networkidle');
      
      const menuBtn = page.locator('button[aria-label*="menu" i]');
      const isBtnVisible = await menuBtn.isVisible();
      
      if (viewport.width < 768) {
        // Should show mobile menu on small screens
        if (isBtnVisible) {
          console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}): Mobile menu button visible`);
        } else {
          console.log(`❌ ${viewport.name} (${viewport.width}x${viewport.height}): Mobile menu button NOT visible`);
        }
      } else {
        // Should hide mobile menu on larger screens
        if (!isBtnVisible) {
          console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}): Mobile menu button hidden (correct)`);
        } else {
          console.log(`⚠️  ${viewport.name} (${viewport.width}x${viewport.height}): Mobile menu button visible (should be hidden)`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  await browser.close();
}

// Run the test
testMobileNavigation().then(() => {
  console.log('\n✅ Mobile navigation testing completed!');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});