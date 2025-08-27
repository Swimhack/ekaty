// Test community chat functionality
const { chromium } = require('playwright');

async function testCommunityChat() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🗣️  TESTING COMMUNITY CHAT FUNCTIONALITY\n');
    console.log('=' .repeat(50));

    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.text().includes('Error')) {
        console.log(`❌ BROWSER ERROR: ${msg.text()}`);
      }
    });

    console.log('1️⃣  NAVIGATING TO COMMUNITY CHAT PAGE');
    console.log('-'.repeat(30));
    
    await page.goto('https://ekaty.com/community');
    console.log('✅ Navigation completed');
    
    // Wait for page to load
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    const pageTitle = await page.title();
    console.log(`📍 Current URL: ${currentUrl}`);
    console.log(`📄 Page title: ${pageTitle}`);

    console.log('\n2️⃣  CHECKING PAGE LOADING STATE');
    console.log('-'.repeat(30));
    
    // Check if still in loading state
    const loadingElement = await page.locator('text=Connecting to Community Chat').count();
    if (loadingElement > 0) {
      console.log('⏳ Page is in loading state');
      await page.waitForTimeout(3000); // Wait for loading to complete
    }
    
    // Check for connection status
    const isConnected = await page.locator('text=Community Chat').count() > 0;
    console.log(`🔗 Chat connected: ${isConnected ? '✅ YES' : '❌ NO'}`);

    console.log('\n3️⃣  CHECKING CHAT FUNCTIONALITY');
    console.log('-'.repeat(30));
    
    // Check for online users indicator
    const onlineUsers = await page.locator('text=/\\d+ online/').textContent().catch(() => null);
    console.log(`👥 Online users: ${onlineUsers || 'Not found'}`);
    
    // Check for message input
    const messageInput = await page.locator('textarea[placeholder*="Share your thoughts"]').count();
    console.log(`💬 Message input found: ${messageInput > 0 ? '✅ YES' : '❌ NO'}`);
    
    // Check for existing messages
    const messagesCount = await page.locator('[class*="hover:bg-gray-50"]').count();
    console.log(`📨 Existing messages: ${messagesCount}`);
    
    if (messagesCount > 0) {
      console.log('📋 Sample messages found:');
      const messageTexts = await page.locator('[class*="hover:bg-gray-50"] p').allTextContents();
      messageTexts.slice(0, 3).forEach((text, i) => {
        console.log(`   ${i + 1}. "${text.substring(0, 50)}..."`);
      });
    }

    console.log('\n4️⃣  TESTING MESSAGE SENDING');
    console.log('-'.repeat(30));
    
    if (messageInput > 0) {
      const testMessage = "Testing the community chat functionality! 🚀";
      console.log(`📝 Attempting to send message: "${testMessage}"`);
      
      try {
        await page.fill('textarea[placeholder*="Share your thoughts"]', testMessage);
        console.log('✅ Message typed successfully');
        
        const sendButton = page.locator('button:has-text("Send")');
        if (await sendButton.count() > 0) {
          const isDisabled = await sendButton.getAttribute('disabled');
          console.log(`🔘 Send button state: ${isDisabled ? 'DISABLED' : 'ENABLED'}`);
          
          if (!isDisabled) {
            await sendButton.click();
            console.log('✅ Send button clicked');
            
            // Wait and check if message appeared
            await page.waitForTimeout(1000);
            const updatedMessagesCount = await page.locator('[class*="hover:bg-gray-50"]').count();
            console.log(`📊 Messages after sending: ${updatedMessagesCount} (was ${messagesCount})`);
            
            if (updatedMessagesCount > messagesCount) {
              console.log('🎉 NEW MESSAGE SUCCESSFULLY ADDED!');
            } else {
              console.log('⚠️  Message may not have been added');
            }
          }
        } else {
          console.log('❌ Send button not found');
        }
      } catch (error) {
        console.log(`❌ Error sending message: ${error.message}`);
      }
    } else {
      console.log('❌ Cannot test message sending - input not found');
    }

    console.log('\n5️⃣  CHECKING INTERACTIVE FEATURES');
    console.log('-'.repeat(30));
    
    // Check for like buttons
    const likeButtons = await page.locator('button:has(svg):has-text(/\\d+/)').count();
    console.log(`❤️  Like buttons found: ${likeButtons}`);
    
    // Check for reply buttons
    const replyButtons = await page.locator('button:has-text("Reply")').count();
    console.log(`↩️  Reply buttons found: ${replyButtons}`);
    
    if (likeButtons > 0) {
      console.log('🧪 Testing like functionality...');
      try {
        const firstLikeButton = page.locator('button:has(svg):has-text(/\\d+/)').first();
        const initialLikes = await firstLikeButton.textContent();
        await firstLikeButton.click();
        await page.waitForTimeout(500);
        const updatedLikes = await firstLikeButton.textContent();
        console.log(`👍 Likes: ${initialLikes} → ${updatedLikes}`);
      } catch (error) {
        console.log(`❌ Error testing likes: ${error.message}`);
      }
    }

    console.log('\n6️⃣  CHECKING COMMUNITY GUIDELINES');
    console.log('-'.repeat(30));
    
    const guidelinesSection = await page.locator('text=Community Guidelines').count();
    console.log(`📋 Guidelines section: ${guidelinesSection > 0 ? '✅ PRESENT' : '❌ MISSING'}`);
    
    if (guidelinesSection > 0) {
      const guidelines = await page.locator('text=Community Guidelines').locator('..').textContent();
      console.log('📝 Guidelines preview:', guidelines.substring(0, 100) + '...');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎯 COMMUNITY CHAT TEST COMPLETED');
    console.log('\n📊 SUMMARY:');
    console.log(`   - Chat page loads: ${isConnected ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Message input works: ${messageInput > 0 ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Messages display: ${messagesCount > 0 ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Interactive features: ${likeButtons > 0 ? '✅ YES' : '❌ NO'}`);
    console.log('=' .repeat(50));

    await page.waitForTimeout(5000); // Keep browser open for inspection

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testCommunityChat().catch(console.error);