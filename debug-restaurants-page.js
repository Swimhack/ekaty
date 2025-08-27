import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugRestaurantsPage() {
    console.log('🔍 Starting restaurants page debug...\n');
    
    const browser = await puppeteer.launch({
        headless: false, // Show browser for debugging
        defaultViewport: {
            width: 1920,
            height: 1080
        }
    });

    try {
        const page = await browser.newPage();
        
        // Set user agent to avoid bot detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        console.log('📍 Navigating to https://ekaty.com/restaurants...');
        await page.goto('https://ekaty.com/restaurants', { 
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait a bit for any dynamic content to load
        await page.waitForTimeout(3000);

        // Get basic page info
        const pageTitle = await page.title();
        const currentUrl = page.url();
        
        console.log(`📄 Page Title: "${pageTitle}"`);
        console.log(`🌐 Current URL: ${currentUrl}\n`);

        // Take screenshot
        const screenshotPath = path.join(__dirname, 'restaurants-page-debug.png');
        await page.screenshot({ 
            path: screenshotPath,
            fullPage: true
        });
        console.log(`📸 Screenshot saved: ${screenshotPath}\n`);

        // Find all heading elements
        console.log('🏷️  HEADING ELEMENTS (h1, h2, h3):');
        const headings = await page.evaluate(() => {
            const headingTags = ['h1', 'h2', 'h3'];
            const results = [];
            
            headingTags.forEach(tag => {
                const elements = document.querySelectorAll(tag);
                elements.forEach(el => {
                    results.push({
                        tag: tag.toUpperCase(),
                        text: el.textContent.trim(),
                        className: el.className || '',
                        id: el.id || ''
                    });
                });
            });
            
            return results;
        });

        if (headings.length > 0) {
            headings.forEach((heading, index) => {
                console.log(`   ${index + 1}. ${heading.tag}: "${heading.text}"`);
                if (heading.className) console.log(`      Class: ${heading.className}`);
                if (heading.id) console.log(`      ID: ${heading.id}`);
                console.log('');
            });
        } else {
            console.log('   ❌ No heading elements found!\n');
        }

        // Find elements containing "restaurant" text
        console.log('🍴 ELEMENTS WITH "RESTAURANT" IN TEXT:');
        const restaurantElements = await page.evaluate(() => {
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            const results = [];
            let node;
            
            while (node = walker.nextNode()) {
                const text = node.textContent.toLowerCase();
                if (text.includes('restaurant')) {
                    const element = node.parentElement;
                    if (element && element.textContent.trim()) {
                        results.push({
                            tagName: element.tagName.toLowerCase(),
                            text: element.textContent.trim(),
                            className: element.className || '',
                            id: element.id || ''
                        });
                    }
                }
            }
            
            // Remove duplicates
            const unique = results.filter((item, index, arr) => 
                arr.findIndex(i => i.text === item.text) === index
            );
            
            return unique;
        });

        if (restaurantElements.length > 0) {
            restaurantElements.forEach((element, index) => {
                console.log(`   ${index + 1}. <${element.tagName}>: "${element.text}"`);
                if (element.className) console.log(`      Class: ${element.className}`);
                if (element.id) console.log(`      ID: ${element.id}`);
                console.log('');
            });
        } else {
            console.log('   ❌ No elements with "restaurant" text found!\n');
        }

        // Check for specific restaurant names that appear on homepage
        console.log('🔎 SEARCHING FOR KNOWN RESTAURANT NAMES:');
        const knownRestaurants = [
            'Texas Tradition',
            'Katy Vibes', 
            'Los Cucos Mexican Cafe',
            'Chick-fil-A',
            'Whataburger',
            'Chipotle',
            'Panda Express'
        ];

        const foundRestaurants = await page.evaluate((restaurants) => {
            const results = [];
            restaurants.forEach(restaurant => {
                const found = document.body.textContent.toLowerCase().includes(restaurant.toLowerCase());
                results.push({
                    name: restaurant,
                    found: found
                });
            });
            return results;
        }, knownRestaurants);

        foundRestaurants.forEach(restaurant => {
            const status = restaurant.found ? '✅' : '❌';
            console.log(`   ${status} ${restaurant.name}`);
        });

        console.log('\n📊 PAGE CONTENT ANALYSIS:');
        
        // Check page content length
        const bodyText = await page.evaluate(() => document.body.textContent);
        console.log(`   Content length: ${bodyText.length} characters`);
        
        // Check if it's a SPA that might need JavaScript loading
        const hasReactOrVue = await page.evaluate(() => {
            return !!(window.React || window.Vue || document.querySelector('[data-reactroot]') || document.querySelector('#__next'));
        });
        console.log(`   SPA Framework detected: ${hasReactOrVue ? 'Yes' : 'No'}`);

        // Check for loading indicators
        const hasLoadingIndicators = await page.evaluate(() => {
            const loadingSelectors = ['.loading', '.spinner', '[data-testid*="loading"]', '.skeleton'];
            return loadingSelectors.some(selector => document.querySelector(selector));
        });
        console.log(`   Loading indicators present: ${hasLoadingIndicators ? 'Yes' : 'No'}`);

        // Save page HTML for inspection
        const htmlContent = await page.content();
        const htmlPath = path.join(__dirname, 'restaurants-page-source.html');
        fs.writeFileSync(htmlPath, htmlContent);
        console.log(`   Page HTML saved: ${htmlPath}`);

    } catch (error) {
        console.error('❌ Error during debugging:', error);
    } finally {
        await browser.close();
        console.log('\n✅ Debug complete!');
    }
}

// Run the debug
debugRestaurantsPage().catch(console.error);