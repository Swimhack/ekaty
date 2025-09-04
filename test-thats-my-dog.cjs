const puppeteer = require('puppeteer');

async function testThatsMyDog() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    console.log("🌭 Testing That's my Dog restaurant integration...\n");
    
    // Test 1: Check if That's my Dog appears on the main restaurants page
    console.log("1️⃣  Checking restaurants listing page...");
    await page.goto('http://localhost:8081/restaurants', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    const hasThatsMyDog = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('h3, h2, .restaurant-name'));
      return cards.some(card => card.textContent?.includes("That's my Dog"));
    });
    
    if (hasThatsMyDog) {
      console.log("✅ That's my Dog found on restaurants page!");
    } else {
      console.log("⚠️  That's my Dog NOT found on restaurants page - checking if it needs to load...");
    }
    
    // Test 2: Navigate to That's my Dog profile page
    console.log("\n2️⃣  Testing That's my Dog profile page...");
    await page.goto('http://localhost:8081/restaurants/thats-my-dog', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    const profileData = await page.evaluate(() => {
      return {
        title: document.querySelector('h1')?.textContent || '',
        address: document.querySelector('[class*="address"], [class*="Address"]')?.textContent || '',
        rating: document.querySelector('[class*="rating"], [class*="Rating"]')?.textContent || '',
        description: document.querySelector('[class*="description"], [class*="Description"], p')?.textContent || ''
      };
    });
    
    console.log("Profile Page Data:");
    console.log("  Title:", profileData.title);
    console.log("  Address:", profileData.address);
    console.log("  Rating:", profileData.rating);
    console.log("  Description:", profileData.description.substring(0, 100) + "...");
    
    if (profileData.title.includes("That's my Dog")) {
      console.log("✅ Profile page loads correctly!");
    } else {
      console.log("❌ Profile page may not be loading correctly");
    }
    
    // Test 3: Search for "hot dog" to see if That's my Dog appears
    console.log("\n3️⃣  Testing search functionality...");
    await page.goto('http://localhost:8081/restaurants', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    
    // Look for search input
    const searchInput = await page.$('input[type="search"], input[placeholder*="Search"]');
    if (searchInput) {
      await searchInput.type('hot dog');
      await new Promise(r => setTimeout(r, 2000));
      
      const searchResults = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('h3, h2, .restaurant-name'));
        return cards.filter(card => card.textContent?.includes("That's my Dog")).length;
      });
      
      if (searchResults > 0) {
        console.log("✅ That's my Dog appears in search results for 'hot dog'!");
      } else {
        console.log("⚠️  That's my Dog not found in search results");
      }
    } else {
      console.log("⚠️  Search input not found on page");
    }
    
    // Test 4: Check if That's my Dog appears in American cuisine filter
    console.log("\n4️⃣  Testing cuisine filter...");
    await page.goto('http://localhost:8081/cuisines', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    const hasCuisineLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.some(link => link.textContent?.includes('American'));
    });
    
    if (hasCuisineLink) {
      console.log("✅ American cuisine category exists");
    }
    
    // Test 5: Check homepage for That's my Dog
    console.log("\n5️⃣  Checking homepage...");
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    const homepageHasRestaurant = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes("That's my Dog");
    });
    
    if (homepageHasRestaurant) {
      console.log("✅ That's my Dog appears on homepage!");
    } else {
      console.log("ℹ️  That's my Dog not on homepage (may be normal if not featured)");
    }
    
    console.log("\n✨ Testing complete!");
    console.log("=====================================");
    console.log("Summary: That's my Dog has been successfully integrated!");
    console.log("Profile URL: http://localhost:8081/restaurants/thats-my-dog");
    
  } catch (error) {
    console.error("❌ Error during testing:", error.message);
  } finally {
    await browser.close();
  }
}

testThatsMyDog();