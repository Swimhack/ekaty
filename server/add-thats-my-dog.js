import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase configuration (from .env.local)
const supabaseUrl = 'https://sixzqokachkcvsqpxoq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeHpxb2thY2h3a2N2c3FweG9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4MDAsImV4cCI6MjA1MDU1MDgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// That's my Dog restaurant data
const thatsMyDogData = {
  name: "That's my Dog",
  description: "Popular hot dog restaurant in Katy, Texas, known for creative gourmet hot dogs, craft burgers, and a fun, family-friendly atmosphere. Features unique hot dog creations with premium toppings and house-made sauces.",
  address: "23119 Colonial Pkwy, Katy, TX 77449",
  phone: "(281) 394-7364",
  website: "http://www.thatsmydog.com",
  email: "info@thatsmydog.com",
  cuisine: ["American", "Hot Dogs", "Burgers", "Casual Dining"],
  price_range: 2,
  rating: 4.5,
  total_reviews_count: 328,
  hours_of_operation: {
    "Monday": "11:00 AM - 9:00 PM",
    "Tuesday": "11:00 AM - 9:00 PM",
    "Wednesday": "11:00 AM - 9:00 PM",
    "Thursday": "11:00 AM - 9:00 PM",
    "Friday": "11:00 AM - 10:00 PM",
    "Saturday": "11:00 AM - 10:00 PM",
    "Sunday": "11:00 AM - 9:00 PM"
  },
  latitude: 29.7869,
  longitude: -95.7106,
  image_url: "https://lh3.googleusercontent.com/p/AF1QipMfNRz5GqXNXCJb6kGVOcJi5NhKhCQXKQGcMQYx=s1360-w1360-h1020",
  status: "active",
  google_maps_url: "https://maps.google.com/?cid=12649487305077259589",
  place_id: "ChIJL7NbQ-VJXIYRhQ_Rq5gOlq8",
  features: {
    delivery: true,
    takeout: true,
    outdoor_seating: true,
    wifi: true,
    kid_friendly: true,
    wheelchair_accessible: true,
    parking: true,
    alcohol: false,
    reservations: false,
    live_music: false,
    pet_friendly: true
  },
  menu_highlights: [
    "Chicago Dog",
    "Chili Cheese Dog",
    "BBQ Bacon Dog",
    "Mac & Cheese Dog",
    "Craft Burgers",
    "Hand-Cut Fries",
    "Onion Rings",
    "Milkshakes"
  ],
  social_media: {
    facebook: "https://www.facebook.com/thatsmydog",
    instagram: "@thatsmydog_katy"
  }
};

async function addThatsMyDog() {
  try {
    console.log("🌭 Adding That's my Dog restaurant to database...");

    // First, check if it already exists
    const { data: existing, error: checkError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('name', "That's my Dog")
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is what we want
      console.error('Error checking for existing restaurant:', checkError);
      return;
    }

    if (existing) {
      console.log("✅ That's my Dog already exists in database. Updating...");
      
      // Update existing restaurant
      const { data, error } = await supabase
        .from('restaurants')
        .update(thatsMyDogData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating restaurant:', error);
      } else {
        console.log("✅ Successfully updated That's my Dog!");
        console.log('Restaurant ID:', data.id);
      }
    } else {
      console.log("➕ Adding new restaurant: That's my Dog");
      
      // Insert new restaurant
      const { data, error } = await supabase
        .from('restaurants')
        .insert([thatsMyDogData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error inserting restaurant:', error);
      } else {
        console.log("✅ Successfully added That's my Dog!");
        console.log('Restaurant ID:', data.id);
      }
    }

    // Verify the restaurant is now in the database
    const { data: verification, error: verifyError } = await supabase
      .from('restaurants')
      .select('id, name, address, rating, cuisine')
      .eq('name', "That's my Dog")
      .single();

    if (verification) {
      console.log("\n📋 Verification - That's my Dog is in the database:");
      console.log('ID:', verification.id);
      console.log('Name:', verification.name);
      console.log('Address:', verification.address);
      console.log('Rating:', verification.rating);
      console.log('Cuisine:', verification.cuisine);
      console.log('\n🔗 Profile URL: /restaurants/thats-my-dog');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
addThatsMyDog();