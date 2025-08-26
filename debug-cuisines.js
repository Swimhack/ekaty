// Debug script to check what cuisine data is actually in the database
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sixzqokachwkcvsqpxoq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeHpxb2thY2h3a2N2c3FweG9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzc5NTUsImV4cCI6MjA1NzY1Mzk1NX0.7oUA3DNoEjihJ4eR9yNpTX3OeMT--uYTIZoN7o54goM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugCuisines() {
  console.log('🔍 Debugging cuisine data in database...\n')
  
  try {
    // Fetch all restaurants with their cuisine data
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('id, name, cuisine')
      .limit(10)
    
    if (error) {
      console.error('❌ Error fetching restaurants:', error)
      return
    }
    
    console.log('📊 Sample restaurant cuisine data:')
    restaurants?.forEach((restaurant, index) => {
      console.log(`${index + 1}. ${restaurant.name}`)
      console.log(`   Cuisines: ${JSON.stringify(restaurant.cuisine)}`)
      console.log(`   Type: ${Array.isArray(restaurant.cuisine) ? 'array' : typeof restaurant.cuisine}`)
      console.log('')
    })
    
    // Get unique cuisines
    const cuisineMap = new Map()
    restaurants?.forEach((restaurant) => {
      if (restaurant.cuisine && Array.isArray(restaurant.cuisine)) {
        restaurant.cuisine.forEach((cuisine) => {
          cuisineMap.set(cuisine, (cuisineMap.get(cuisine) || 0) + 1)
        })
      }
    })
    
    console.log('🍽️  Unique cuisines found in database:')
    Array.from(cuisineMap.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([cuisine, count]) => {
        console.log(`   "${cuisine}" (${count} restaurants)`)
      })
    
    console.log('\n🔍 Testing specific cuisine filters...')
    
    // Test filtering by specific cuisines
    const testCuisines = ['Italian', 'Mexican', 'BBQ', 'Asian', 'Steakhouse', 'Breakfast']
    
    for (const cuisine of testCuisines) {
      console.log(`\n🧪 Testing cuisine: "${cuisine}"`)
      
      // Test with overlaps
      const { data: overlapsResults, error: overlapsError } = await supabase
        .from('restaurants')
        .select('id, name, cuisine')
        .overlaps('cuisine', [cuisine])
        .limit(3)
      
      console.log(`   Overlaps results: ${overlapsResults?.length || 0} restaurants`)
      if (overlapsResults && overlapsResults.length > 0) {
        overlapsResults.forEach(r => console.log(`     - ${r.name}: ${JSON.stringify(r.cuisine)}`))
      }
      
      // Test with contains
      const { data: containsResults, error: containsError } = await supabase
        .from('restaurants')
        .select('id, name, cuisine')
        .contains('cuisine', [cuisine])
        .limit(3)
      
      console.log(`   Contains results: ${containsResults?.length || 0} restaurants`)
      if (containsResults && containsResults.length > 0) {
        containsResults.forEach(r => console.log(`     - ${r.name}: ${JSON.stringify(r.cuisine)}`))
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

debugCuisines()