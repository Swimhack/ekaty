// Simple script to verify environment variables are working on production
// Run this in browser console on https://ekaty.com to check if VITE_ variables are loaded

console.log('🔍 Checking eKaty.com Environment Variables...\n');

// Check if Vite environment variables are available
const checks = [
  { name: 'VITE_SUPABASE_URL', value: import.meta.env?.VITE_SUPABASE_URL },
  { name: 'VITE_SUPABASE_ANON_KEY', value: import.meta.env?.VITE_SUPABASE_ANON_KEY },
  { name: 'VITE_APP_URL', value: import.meta.env?.VITE_APP_URL },
  { name: 'VITE_APP_NAME', value: import.meta.env?.VITE_APP_NAME },
  { name: 'VITE_GOOGLE_PLACES_API_KEY', value: import.meta.env?.VITE_GOOGLE_PLACES_API_KEY }
];

let passedChecks = 0;
checks.forEach(check => {
  const status = check.value ? '✅' : '❌';
  const displayValue = check.value ? 
    (check.value.length > 20 ? check.value.substring(0, 20) + '...' : check.value) : 
    'MISSING';
  
  console.log(`${status} ${check.name}: ${displayValue}`);
  if (check.value) passedChecks++;
});

console.log(`\n🎯 Environment Score: ${Math.round((passedChecks / checks.length) * 100)}%`);

if (passedChecks === checks.length) {
  console.log('🎉 All environment variables are properly configured!');
  console.log('✅ The /restaurants route should now work correctly.');
} else {
  console.log('❌ Environment variables are missing or incorrectly configured.');
  console.log('🔧 Follow the instructions in CRITICAL-NETLIFY-ENV-FIX.md');
}

// Test Supabase connection if variables are available
if (checks[0].value && checks[1].value) {
  console.log('\n🧪 Testing Supabase connection...');
  
  fetch(`${checks[0].value}/rest/v1/restaurants?limit=1`, {
    headers: {
      'apikey': checks[1].value,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      console.log('✅ Supabase connection successful!');
      console.log('✅ Restaurant data should load correctly.');
    } else {
      console.log(`❌ Supabase connection failed: ${response.status}`);
    }
  })
  .catch(error => {
    console.log(`❌ Supabase connection error:`, error.message);
  });
}