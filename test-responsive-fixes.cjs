const { chromium } = require('playwright');

async function testResponsiveFixes() {
  console.log('🎯 RESPONSIVE DESIGN OVERFLOW FIX VERIFICATION');
  console.log('='.repeat(55));
  console.log();
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('📱 Testing responsive design fixes...');
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
    
    // Test different viewport sizes
    const viewports = [
      { name: 'Mobile (375px)', width: 375, height: 667 },
      { name: 'Mobile Large (414px)', width: 414, height: 896 },
      { name: 'Tablet (768px)', width: 768, height: 1024 },
      { name: 'Tablet Large (1024px)', width: 1024, height: 768 },
      { name: 'Desktop (1920px)', width: 1920, height: 1080 }
    ];
    
    const results = [];
    
    for (const viewport of viewports) {
      console.log(`\n📐 Testing ${viewport.name}:`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500); // Allow layout to settle
      
      // Check for horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const windowWidth = await page.evaluate(() => window.innerWidth);
      
      const hasOverflow = bodyWidth > viewport.width;
      const overflowAmount = bodyWidth - viewport.width;
      
      const result = {
        viewport: viewport.name,
        expectedWidth: viewport.width,
        actualWidth: bodyWidth,
        windowWidth: windowWidth,
        hasOverflow: hasOverflow,
        overflowAmount: overflowAmount,
        status: hasOverflow ? '❌ OVERFLOW' : '✅ FIT'
      };
      
      results.push(result);
      
      console.log(`   Expected width: ${viewport.width}px`);
      console.log(`   Actual content width: ${bodyWidth}px`);
      console.log(`   Window inner width: ${windowWidth}px`);
      console.log(`   Status: ${result.status}`);
      
      if (hasOverflow) {
        console.log(`   ⚠️  Overflow amount: +${overflowAmount}px`);
        
        // Try to identify overflow sources
        const overflowElements = await page.evaluate(() => {
          const elements = [];
          document.querySelectorAll('*').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
              elements.push({
                tagName: el.tagName,
                className: el.className,
                id: el.id,
                width: rect.width,
                right: rect.right,
                overflow: rect.right - window.innerWidth
              });
            }
          });
          return elements.slice(0, 5); // Top 5 overflow elements
        });
        
        if (overflowElements.length > 0) {
          console.log('   🔍 Elements causing overflow:');
          overflowElements.forEach((el, i) => {
            console.log(`     ${i + 1}. ${el.tagName}.${el.className || 'no-class'} (overflow: +${el.overflow.toFixed(1)}px)`);
          });
        }
      } else {
        console.log('   ✅ Content fits within viewport boundaries');
      }
    }
    
    // Summary
    console.log('\n📊 RESPONSIVE DESIGN TEST SUMMARY');
    console.log('='.repeat(40));
    
    const passedTests = results.filter(r => !r.hasOverflow);
    const failedTests = results.filter(r => r.hasOverflow);
    
    console.log(`✅ Passed: ${passedTests.length}/${results.length} viewport tests`);
    console.log(`❌ Failed: ${failedTests.length}/${results.length} viewport tests`);
    
    if (failedTests.length > 0) {
      console.log('\n🔧 FAILED TESTS DETAILS:');
      failedTests.forEach(test => {
        console.log(`   • ${test.viewport}: ${test.actualWidth}px (expected ≤${test.expectedWidth}px)`);
      });
    }
    
    if (passedTests.length === results.length) {
      console.log('\n🎉 SUCCESS! All responsive design overflow issues have been fixed!');
      console.log('✅ Mobile (375px): Content fits viewport');
      console.log('✅ Tablet (768px): Content fits viewport');  
      console.log('✅ Desktop (1920px): Content fits viewport');
    } else {
      console.log('\n⚠️  Some viewport tests still have overflow issues that need attention.');
    }
    
    // Take screenshots for documentation
    console.log('\n📸 Taking screenshots for documentation...');
    for (const viewport of viewports.slice(0, 3)) { // Just mobile, tablet, desktop
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      const filename = `responsive-fix-${viewport.width}px.png`;
      await page.screenshot({ 
        path: filename,
        fullPage: true 
      });
      console.log(`   • Saved: ${filename}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testResponsiveFixes()
  .then(() => {
    console.log('\n✅ Responsive design testing completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
  });