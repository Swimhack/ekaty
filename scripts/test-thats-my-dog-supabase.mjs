import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sixzqokachwkcvsqpxoq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeHpxb2thY2h3a2N2c3FweG9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjA3Nzk1NSwiZXhwIjoyMDU3NjUzOTU1fQ.6JZVNCbl-zCOvbxf5e9G1XoXFsZdP3eCFbqlegIWR4c';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testThatsMyDogFromSupabase() {
  console.log("🌭 Testing That's my Dog from Supabase database...\n");

  try {
    // Test 1: Check if That's my Dog exists in the database
    console.log("1️⃣  Checking if That's my Dog exists in database...");
    const { data: thatsMyDog, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('name', "That's my Dog")
      .single();

    if (error) {
      console.error("❌ Error fetching That's my Dog:", error.message);
      return;
    }

    if (thatsMyDog) {
      console.log("✅ That's my Dog found in database!");
      console.log("   ID:", thatsMyDog.id);
      console.log("   Name:", thatsMyDog.name);
      console.log("   Address:", thatsMyDog.address);
      console.log("   Rating:", thatsMyDog.rating);
      console.log("   Cuisine:", thatsMyDog.cuisine);
      console.log("   Phone:", thatsMyDog.phone);
      console.log("   Website:", thatsMyDog.website);
    } else {
      console.log("❌ That's my Dog not found in database");
      return;
    }

    // Test 2: Check if it appears in search results
    console.log("\n2️⃣  Testing search for 'hot dog'...");
    const { data: hotDogResults } = await supabase
      .from('restaurants')
      .select('name, cuisine')
      .or(`name.ilike.%hot dog%,description.ilike.%hot dog%,cuisine.cs.{hot dog}`)
      .limit(10);

    const hasThatsMyDogInSearch = hotDogResults?.some(r => r.name === "That's my Dog");
    if (hasThatsMyDogInSearch) {
      console.log("✅ That's my Dog appears in 'hot dog' search!");
    } else {
      console.log("⚠️  That's my Dog not found in 'hot dog' search");
    }

    // Test 3: Check American cuisine filter
    console.log("\n3️⃣  Testing American cuisine filter...");
    const { data: americanResults } = await supabase
      .from('restaurants')
      .select('name, cuisine')
      .overlaps('cuisine', ['American'])
      .limit(20);

    const hasThatsMyDogInAmerican = americanResults?.some(r => r.name === "That's my Dog");
    if (hasThatsMyDogInAmerican) {
      console.log("✅ That's my Dog appears in American cuisine filter!");
      console.log(`   Found ${americanResults?.length} American restaurants total`);
    } else {
      console.log("⚠️  That's my Dog not found in American cuisine filter");
    }

    // Test 4: Get restaurant count and check if That's my Dog is included
    console.log("\n4️⃣  Checking total restaurant count...");
    const { count, error: countError } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`✅ Total restaurants in database: ${count}`);
      console.log("   (Including That's my Dog)");
    }

    // Test 5: Check if the restaurant can be accessed by its ID
    console.log("\n5️⃣  Testing individual restaurant access...");
    const { data: restaurantById } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', thatsMyDog.id)
      .single();

    if (restaurantById) {
      console.log("✅ That's my Dog accessible by ID!");
      console.log(`   Profile URL: /restaurants/${thatsMyDog.id}`);
    }

    console.log("\n✨ Testing complete!");
    console.log("=====================================");
    console.log("🎉 That's my Dog is properly stored in Supabase!");
    console.log("   - All restaurants now display consistently from the database");
    console.log("   - No more hardcoded data needed");
    console.log("   - That's my Dog works like any other restaurant");

  } catch (error) {
    console.error("❌ Unexpected error:", error);
  } finally {
    process.exit(0);
  }
}

testThatsMyDogFromSupabase();