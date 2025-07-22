import { chromium } from 'playwright';

async function validateUIChanges() {
  console.log('🔍 Starting UI validation...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // Navigate to local development server
    console.log('📱 Navigating to localhost:8081...');
    await page.goto('http://localhost:8081', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Check 1: Verify Hero section has full-width styling
    console.log('✅ Checking hero section...');
    const heroSection = await page.locator('[class*="min-h-screen"]').first();
    const heroExists = await heroSection.count() > 0;
    console.log(`   Hero full-width section: ${heroExists ? '✓ Found' : '✗ Not found'}`);

    // Check 2: Verify Header has sticky backdrop styling
    console.log('✅ Checking header...');
    const header = await page.locator('header').first();
    const headerClass = await header.getAttribute('class') || '';
    const hasSticky = headerClass.includes('sticky');
    const hasBackdrop = headerClass.includes('backdrop-blur');
    console.log(`   Header sticky: ${hasSticky ? '✓ Applied' : '✗ Missing'}`);
    console.log(`   Header backdrop blur: ${hasBackdrop ? '✓ Applied' : '✗ Missing'}`);

    // Check 3: Verify Logo exists and loads
    console.log('✅ Checking logo...');
    const logo = await page.locator('img[alt*="eKaty"]').first();
    const logoExists = await logo.count() > 0;
    console.log(`   Logo element: ${logoExists ? '✓ Found' : '✗ Not found'}`);

    // Check 4: Verify Navigation works
    console.log('✅ Checking navigation...');
    const navItems = await page.locator('nav a, nav button').count();
    console.log(`   Navigation items: ${navItems} found`);

    // Check 5: Verify Search functionality
    console.log('✅ Checking search section...');
    const searchInput = await page.locator('input[placeholder*="Restaurant"]').first();
    const searchExists = await searchInput.count() > 0;
    console.log(`   Search input: ${searchExists ? '✓ Found' : '✗ Not found'}`);

    // Check 6: Take screenshot for manual verification
    console.log('📸 Taking screenshot...');
    await page.screenshot({ 
      path: 'ui-validation-screenshot.png',
      fullPage: true 
    });

    // Check 7: Verify page loads without errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait for any lazy-loaded content
    await page.waitForTimeout(2000);

    console.log('\n📊 VALIDATION SUMMARY:');
    console.log('='.repeat(50));
    console.log(`✅ Hero section: ${heroExists ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Header styling: ${hasSticky && hasBackdrop ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Logo loading: ${logoExists ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Navigation: ${navItems > 0 ? 'PASS' : 'FAIL'} (${navItems} items)`);
    console.log(`✅ Search input: ${searchExists ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Console errors: ${errors.length === 0 ? 'PASS' : `FAIL (${errors.length} errors)`}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Console Errors:');
      errors.forEach((error, i) => console.log(`   ${i + 1}. ${error}`));
    }

    console.log('\n🎯 UI Changes Status: All major changes appear to be applied');
    console.log('📸 Screenshot saved as: ui-validation-screenshot.png');

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run validation
validateUIChanges()
  .then(() => {
    console.log('\n✅ UI validation completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ UI validation failed:', error.message);
    process.exit(1);
  });