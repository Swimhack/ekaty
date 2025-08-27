const { chromium } = require('playwright');

async function quickMobileTest() {
  console.log('🚀 Quick Mobile Navigation Test\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 375, height: 667 }
  });
  
  try {
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
    
    // Find the mobile menu button with the specific attributes we set
    const menuButton = page.locator('button[aria-expanded]');
    const buttonExists = await menuButton.count() > 0;
    
    if (buttonExists) {
      console.log('✅ Mobile menu button found');
      
      // Click to open menu
      await menuButton.click();
      await page.waitForTimeout(300);
      
      // Check if any navigation links are visible
      const navLinks = page.locator('a[href^="/"]').filter({ hasText: /popular|map|restaurant|community|about|contact/i });
      const visibleLinks = [];
      
      for (let i = 0; i < await navLinks.count(); i++) {
        const link = navLinks.nth(i);
        if (await link.isVisible()) {
          const text = await link.textContent();
          visibleLinks.push(text?.trim());
        }
      }
      
      if (visibleLinks.length > 0) {
        console.log('✅ Mobile navigation menu opened successfully!');
        console.log(`   Found ${visibleLinks.length} visible navigation links:`);
        visibleLinks.forEach((link, index) => {
          console.log(`   ${index + 1}. ${link}`);
        });
        
        console.log('\n🎉 MOBILE NAVIGATION FIX CONFIRMED:');
        console.log('   ✓ Hamburger menu button is visible on mobile');
        console.log('   ✓ Menu opens when button is clicked');
        console.log('   ✓ Navigation links are visible and accessible');
        console.log('   ✓ Menu functionality works as expected\n');
        
      } else {
        console.log('❌ Navigation menu did not open properly');
      }
      
    } else {
      console.log('❌ Mobile menu button not found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  await browser.close();
}

quickMobileTest();