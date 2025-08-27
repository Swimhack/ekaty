import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugSPARouting() {
    console.log('🔍 Starting SPA routing debug...\n');
    
    const browser = await chromium.launch({ 
        headless: false // Show browser for debugging
    });

    try {
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });
        
        const page = await context.newPage();
        
        // Test 1: Homepage
        console.log('🏠 TESTING HOMEPAGE (https://ekaty.com)');
        console.log('==========================================');
        
        await page.goto('https://ekaty.com', { 
            waitUntil: 'networkidle',
            timeout: 30000
        });

        await page.waitForTimeout(2000);

        const homePageTitle = await page.title();
        const homeCurrentUrl = page.url();
        
        console.log(`📄 Page Title: "${homePageTitle}"`);
        console.log(`🌐 Current URL: ${homeCurrentUrl}`);
        
        // Check for React app indicators on homepage
        const homeHasReactRoot = await page.evaluate(() => {
            return !!(document.querySelector('#root') && 
                     document.querySelector('#root').innerHTML.length > 100);
        });
        
        console.log(`⚛️  React app loaded: ${homeHasReactRoot ? 'YES' : 'NO'}`);
        
        // Look for restaurant data on homepage
        const homeRestaurantElements = await page.evaluate(() => {
            const text = document.body.textContent.toLowerCase();
            const hasRestaurantText = text.includes('texas tradition') || 
                                     text.includes('katy vibes') || 
                                     text.includes('los cucos');
            
            const restaurantHeadings = [];
            const headings = document.querySelectorAll('h1, h2, h3, h4');
            headings.forEach(h => {
                const headingText = h.textContent.trim();
                if (headingText.toLowerCase().includes('restaurant') || 
                    headingText.toLowerCase().includes('texas tradition') ||
                    headingText.toLowerCase().includes('katy vibes')) {
                    restaurantHeadings.push(headingText);
                }
            });
            
            return {
                hasRestaurantText,
                restaurantHeadings,
                bodyLength: document.body.textContent.length
            };
        });
        
        console.log(`🍽️  Has restaurant content: ${homeRestaurantElements.hasRestaurantText ? 'YES' : 'NO'}`);
        console.log(`📊 Content length: ${homeRestaurantElements.bodyLength} characters`);
        if (homeRestaurantElements.restaurantHeadings.length > 0) {
            console.log('📋 Restaurant headings found:');
            homeRestaurantElements.restaurantHeadings.forEach((heading, i) => {
                console.log(`   ${i + 1}. "${heading}"`);
            });
        }
        
        // Take screenshot of homepage
        await page.screenshot({ 
            path: path.join(__dirname, 'homepage-debug.png'),
            fullPage: true
        });
        
        console.log('\n🔗 TESTING DIRECT RESTAURANTS PAGE ACCESS');
        console.log('==========================================');
        
        // Test 2: Direct access to restaurants page
        await page.goto('https://ekaty.com/restaurants', { 
            waitUntil: 'networkidle',
            timeout: 30000
        });

        await page.waitForTimeout(2000);

        const restaurantsPageTitle = await page.title();
        const restaurantsCurrentUrl = page.url();
        
        console.log(`📄 Page Title: "${restaurantsPageTitle}"`);
        console.log(`🌐 Current URL: ${restaurantsCurrentUrl}`);
        
        // Check what type of page was served
        const restaurantsPageAnalysis = await page.evaluate(() => {
            const bodyText = document.body.textContent;
            const is404 = bodyText.includes('404') || bodyText.includes('Not Found') || bodyText.includes('Oops!');
            const hasReactRoot = !!(document.querySelector('#root') && 
                                   document.querySelector('#root').innerHTML.length > 100);
            const hasRestaurantsContent = bodyText.toLowerCase().includes('restaurants in katy') ||
                                         bodyText.toLowerCase().includes('discover') ||
                                         bodyText.toLowerCase().includes('search restaurants');
            
            const headings = [];
            document.querySelectorAll('h1, h2, h3').forEach(h => {
                headings.push({
                    tag: h.tagName,
                    text: h.textContent.trim()
                });
            });
            
            return {
                is404,
                hasReactRoot,
                hasRestaurantsContent,
                bodyLength: bodyText.length,
                headings,
                bodyText: bodyText.substring(0, 200) + '...'
            };
        });
        
        console.log(`⚛️  React app loaded: ${restaurantsPageAnalysis.hasReactRoot ? 'YES' : 'NO'}`);
        console.log(`❌ Is 404 page: ${restaurantsPageAnalysis.is404 ? 'YES' : 'NO'}`);
        console.log(`🍽️  Has restaurants content: ${restaurantsPageAnalysis.hasRestaurantsContent ? 'YES' : 'NO'}`);
        console.log(`📊 Content length: ${restaurantsPageAnalysis.bodyLength} characters`);
        console.log(`📋 Page content preview: "${restaurantsPageAnalysis.bodyText}"`);
        
        if (restaurantsPageAnalysis.headings.length > 0) {
            console.log('📋 Headings found:');
            restaurantsPageAnalysis.headings.forEach((heading, i) => {
                console.log(`   ${i + 1}. ${heading.tag}: "${heading.text}"`);
            });
        }
        
        // Take screenshot of restaurants page
        await page.screenshot({ 
            path: path.join(__dirname, 'restaurants-direct-debug.png'),
            fullPage: true
        });
        
        console.log('\n🧭 TESTING CLIENT-SIDE NAVIGATION');
        console.log('==================================');
        
        // Test 3: Navigate from homepage to restaurants via client-side routing
        await page.goto('https://ekaty.com', { 
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        await page.waitForTimeout(2000);
        
        // Look for navigation link to restaurants
        const navLink = await page.locator('a[href="/restaurants"], a[href*="restaurant"]').first();
        
        if (await navLink.count() > 0) {
            console.log('🔗 Found navigation link to restaurants, clicking...');
            await navLink.click();
            await page.waitForTimeout(3000);
            
            const navPageTitle = await page.title();
            const navCurrentUrl = page.url();
            
            console.log(`📄 Page Title after navigation: "${navPageTitle}"`);
            console.log(`🌐 Current URL after navigation: ${navCurrentUrl}`);
            
            const navPageAnalysis = await page.evaluate(() => {
                const bodyText = document.body.textContent;
                const hasRestaurantsContent = bodyText.toLowerCase().includes('restaurants in katy') ||
                                             bodyText.toLowerCase().includes('discover') ||
                                             bodyText.toLowerCase().includes('search restaurants');
                const is404 = bodyText.includes('404');
                
                return {
                    hasRestaurantsContent,
                    is404,
                    bodyLength: bodyText.length,
                    bodyText: bodyText.substring(0, 200) + '...'
                };
            });
            
            console.log(`🍽️  Has restaurants content after nav: ${navPageAnalysis.hasRestaurantsContent ? 'YES' : 'NO'}`);
            console.log(`❌ Is 404 after nav: ${navPageAnalysis.is404 ? 'YES' : 'NO'}`);
            console.log(`📊 Content length after nav: ${navPageAnalysis.bodyLength} characters`);
            
            // Take screenshot after navigation
            await page.screenshot({ 
                path: path.join(__dirname, 'restaurants-nav-debug.png'),
                fullPage: true
            });
        } else {
            console.log('❌ No navigation link to restaurants found');
        }
        
        console.log('\n🌐 NETWORK ANALYSIS');
        console.log('===================');
        
        // Test 4: Check network responses
        const responses = [];
        page.on('response', response => {
            responses.push({
                url: response.url(),
                status: response.status(),
                statusText: response.statusText()
            });
        });
        
        await page.goto('https://ekaty.com/restaurants', { 
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        console.log('🌐 Network responses for /restaurants:');
        responses.slice(-10).forEach(response => { // Show last 10 responses
            const status = response.status === 200 ? '✅' : 
                          response.status === 404 ? '❌' : 
                          response.status >= 400 ? '⚠️' : '📄';
            console.log(`   ${status} ${response.status} ${response.statusText} - ${response.url}`);
        });
        
        // Summary
        console.log('\n📋 SUMMARY');
        console.log('==========');
        console.log(`🏠 Homepage works: ${homeHasReactRoot ? 'YES' : 'NO'}`);
        console.log(`🔗 Direct /restaurants access: ${restaurantsPageAnalysis.is404 ? 'SHOWS 404' : 'WORKS'}`);
        console.log(`🧭 Client-side navigation: ${navPageAnalysis?.hasRestaurantsContent ? 'WORKS' : 'NOT TESTED'}`);
        
        if (restaurantsPageAnalysis.is404) {
            console.log('\n🔧 DIAGNOSIS: Server is not properly configured for SPA routing!');
            console.log('   The server returns a 404 page instead of serving index.html');
            console.log('   for the /restaurants route. This breaks direct URL access.');
            console.log('\n💡 SOLUTION: Configure server to serve index.html for all routes');
            console.log('   that don\'t match static files (SPA fallback routing).');
        }

    } catch (error) {
        console.error('❌ Error during debugging:', error);
    } finally {
        await browser.close();
        console.log('\n✅ Debug complete!');
    }
}

// Run the debug
debugSPARouting().catch(console.error);