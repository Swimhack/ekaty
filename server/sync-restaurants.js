#!/usr/bin/env node

import RestaurantSyncService from './restaurant-sync-service.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else if (fs.existsSync('.env')) {
  dotenv.config();
}

/**
 * Main synchronization script
 * Usage: node server/sync-restaurants.js
 */
async function main() {
  console.log('🚀 Restaurant Synchronization Script Starting...');
  console.log('='.repeat(50));
  
  // Validate environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY', 
    'GOOGLE_PLACES_API_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('Please check your .env.local file');
    process.exit(1);
  }

  try {
    // Initialize sync service
    const syncService = new RestaurantSyncService(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      process.env.GOOGLE_PLACES_API_KEY
    );

    const startTime = Date.now();
    
    // Run synchronization
    const results = await syncService.syncAllRestaurants();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // Log final results
    console.log('='.repeat(50));
    console.log('📊 SYNCHRONIZATION COMPLETE');
    console.log('='.repeat(50));
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`➕ Created: ${results.created} restaurants`);
    console.log(`✏️  Updated: ${results.updated} restaurants`);
    console.log(`⚖️  Unchanged: ${results.unchanged} restaurants`);
    console.log(`❌ Errors: ${results.errors} restaurants`);
    console.log(`📈 Total Processed: ${results.created + results.updated + results.unchanged + results.errors}`);
    
    // Log results to file for monitoring
    const logEntry = {
      timestamp: new Date().toISOString(),
      duration: duration,
      results: results,
      success: results.errors === 0
    };
    
    await logSyncResults(logEntry);
    
    if (results.errors > 0) {
      console.log(`\n⚠️  ${results.errors} errors occurred during synchronization. Check logs for details.`);
      process.exit(1);
    } else {
      console.log('\n✅ All restaurants synchronized successfully!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('💥 Critical error during synchronization:', error.message);
    console.error(error.stack);
    
    // Log error
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      success: false
    };
    
    await logSyncResults(errorLog);
    process.exit(1);
  }
}

/**
 * Log synchronization results to file
 */
async function logSyncResults(logEntry) {
  try {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, 'restaurant-sync.log');
    const logLine = JSON.stringify(logEntry) + '\n';
    
    fs.appendFileSync(logFile, logLine);
  } catch (error) {
    console.warn('⚠️  Failed to write to log file:', error.message);
  }
}

/**
 * Handle process signals for graceful shutdown
 */
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled promise rejection:', error);
  process.exit(1);
});

// Run the main function
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;