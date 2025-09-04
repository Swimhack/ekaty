import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://sixzqokachwkcvsqpxoq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeHpxb2thY2h3a2N2c3FweG9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjA3Nzk1NSwiZXhwIjoyMDU3NjUzOTU1fQ.6JZVNCbl-zCOvbxf5e9G1XoXFsZdP3eCFbqlegIWR4c';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// That's my Dog restaurant data - matching the actual Supabase schema
const thatsMyDogData = {
  id: "thats-my-dog-katy-tx-" + Date.now(), // Unique ID
  name: "That's my Dog",
  description: "Popular hot dog restaurant in Katy, Texas, known for creative gourmet hot dogs, craft burgers, and a fun, family-friendly atmosphere. Features unique hot dog creations with premium toppings and house-made sauces.",
  address: "23119 Colonial Pkwy, Katy, TX 77449",
  phone: "(281) 394-7364",
  website: "http://www.thatsmydog.com",
  cuisine: ["American", "Hot Dogs", "Burgers", "Casual Dining"],
  price_range: 2,
  rating: 4.5,
  total_reviews_count: 328,
  hours: {
    "Monday": "11:00 AM - 9:00 PM",
    "Tuesday": "11:00 AM - 9:00 PM",
    "Wednesday": "11:00 AM - 9:00 PM",
    "Thursday": "11:00 AM - 9:00 PM",
    "Friday": "11:00 AM - 10:00 PM",
    "Saturday": "11:00 AM - 10:00 PM",
    "Sunday": "11:00 AM - 9:00 PM"
  },
  opening_hours: {
    "weekday_text": [
      "Monday: 11:00 AM – 9:00 PM",
      "Tuesday: 11:00 AM – 9:00 PM",
      "Wednesday: 11:00 AM – 9:00 PM",
      "Thursday: 11:00 AM – 9:00 PM",
      "Friday: 11:00 AM – 10:00 PM",
      "Saturday: 11:00 AM – 10:00 PM",
      "Sunday: 11:00 AM – 9:00 PM"
    ]
  },
  latitude: 29.7869,
  longitude: -95.7106,
  image: "https://lh3.googleusercontent.com/p/AF1QipMfNRz5GqXNXCJb6kGVOcJi5NhKhCQXKQGcMQYx=s1360-w1360-h1020",
  google_place_id: "ChIJL7NbQ-VJXIYRhQ_Rq5gOlq8",
  popular: true,
  is_featured: true,
  is_claimed: false,
  distance: 0,
  types: ["restaurant", "food", "point_of_interest", "establishment"]
};

async function addThatsMyDogToSupabase() {
  try {
    console.log("🌭 Adding That's my Dog to Supabase database...\n");

    // First, check if it already exists
    console.log("Checking if That's my Dog already exists...");
    const { data: existing, error: checkError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('name', "That's my Dog")
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing restaurant:', checkError);
      return;
    }

    if (existing) {
      console.log("Restaurant already exists. Updating...");
      
      // Update existing restaurant
      const { data, error } = await supabase
        .from('restaurants')
        .update(thatsMyDogData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating restaurant:', error);
        return;
      }
      
      console.log("✅ Successfully updated That's my Dog!");
      console.log('Restaurant ID:', data.id);
      console.log('Name:', data.name);
      console.log('Address:', data.address);
      console.log('Rating:', data.rating);
      console.log('Cuisine:', data.cuisine);
    } else {
      console.log("Adding new restaurant to database...");
      
      // Insert new restaurant
      const { data, error } = await supabase
        .from('restaurants')
        .insert([thatsMyDogData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error inserting restaurant:', error);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        return;
      }
      
      console.log("✅ Successfully added That's my Dog to Supabase!");
      console.log('Restaurant ID:', data.id);
      console.log('Name:', data.name);
      console.log('Address:', data.address);
      console.log('Rating:', data.rating);
      console.log('Cuisine:', data.cuisine);
    }

    // Verify the restaurant is now in the database
    console.log("\n📋 Verifying restaurant in database...");
    const { data: verification, error: verifyError } = await supabase
      .from('restaurants')
      .select('id, name, address, rating, cuisine')
      .eq('name', "That's my Dog")
      .single();

    if (verification) {
      console.log("✅ Verification successful!");
      console.log('Database ID:', verification.id);
      console.log('Profile URL will be: /restaurants/' + verification.id);
    } else {
      console.log("⚠️ Could not verify restaurant in database");
    }

    // Get total restaurant count
    const { count, error: countError } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`\n📊 Total restaurants in database: ${count}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
addThatsMyDogToSupabase();