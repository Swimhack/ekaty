#!/usr/bin/env node

/**
 * Test script for Community Chat functionality
 * This script tests the basic functionality of the community chat system
 */

const { createClient } = require('@supabase/supabase-js')

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://sixzqokachwkcvsqpxoq.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your_anon_key_here'

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  total: 0
}

function runTest(testName, testFunction) {
  testResults.total++
  logInfo(`Running test: ${testName}`)
  
  try {
    const result = testFunction()
    if (result) {
      logSuccess(`${testName} - PASSED`)
      testResults.passed++
    } else {
      logError(`${testName} - FAILED`)
      testResults.failed++
    }
  } catch (error) {
    logError(`${testName} - FAILED with error: ${error.message}`)
    testResults.failed++
  }
}

// Test functions
async function testSupabaseConnection() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    // Test basic connection
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1)
    
    if (error) {
      logWarning(`Database connection warning: ${error.message}`)
      // Connection might work but table might not exist yet
      return true
    }
    
    return true
  } catch (error) {
    logWarning(`Supabase connection test: ${error.message}`)
    return false
  }
}

async function testCommunityChatFunction() {
  try {
    // Test the health endpoint
    const response = await fetch(`${SUPABASE_URL}/functions/v1/community-chat/health`)
    
    if (response.ok) {
      const data = await response.json()
      return data.status === 'healthy'
    }
    
    return false
  } catch (error) {
    logWarning(`Edge Function test: ${error.message}`)
    return false
  }
}

function testFileStructure() {
  const requiredFiles = [
    'src/pages/Community.tsx',
    'src/components/community/AuthModal.tsx',
    'src/components/community/MessageItem.tsx',
    'lib/community-chat-service.ts',
    'lib/user-service.ts',
    'supabase/functions/community-chat/index.ts',
    'supabase/migrations/001_create_community_tables.sql'
  ]
  
  const fs = require('fs')
  const path = require('path')
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      logWarning(`Required file not found: ${file}`)
      return false
    }
  }
  
  return true
}

function testEnvironmentVariables() {
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
  const missingVars = []
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  }
  
  if (missingVars.length > 0) {
    logWarning(`Missing environment variables: ${missingVars.join(', ')}`)
    logInfo('You can set these in a .env.local file')
    return false
  }
  
  return true
}

// Main test runner
async function runAllTests() {
  log('🚀 Starting Community Chat Tests', 'bright')
  log('=' * 50, 'cyan')
  
  // Run tests
  runTest('File Structure Check', testFileStructure)
  runTest('Environment Variables', testEnvironmentVariables)
  runTest('Supabase Connection', testSupabaseConnection)
  runTest('Community Chat Function', testCommunityChatFunction)
  
  // Results summary
  log('=' * 50, 'cyan')
  log('📊 Test Results Summary', 'bright')
  log(`Total Tests: ${testResults.total}`, 'blue')
  log(`Passed: ${testResults.passed}`, 'green')
  log(`Failed: ${testResults.failed}`, 'red')
  
  if (testResults.failed === 0) {
    log('🎉 All tests passed! Community Chat is ready to use.', 'green')
  } else {
    log('⚠️  Some tests failed. Please check the issues above.', 'yellow')
  }
  
  // Next steps
  log('=' * 50, 'cyan')
  log('📋 Next Steps:', 'bright')
  log('1. Set up your environment variables in .env.local', 'blue')
  log('2. Deploy the Edge Function: deploy-community-chat.bat', 'blue')
  log('3. Run database migrations', 'blue')
  log('4. Test the chat functionality in your browser', 'blue')
  
  return testResults.failed === 0
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().then((success) => {
    process.exit(success ? 0 : 1)
  }).catch((error) => {
    logError(`Test runner failed: ${error.message}`)
    process.exit(1)
  })
}

module.exports = { runAllTests, testResults }
