import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sixzqokachwkcvsqpxoq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeHpxb2thY2h3a2N2c3FweG9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjA3Nzk1NSwiZXhwIjoyMDU3NjUzOTU1fQ.6JZVNCbl-zCOvbxf5e9G1XoXFsZdP3eCFbqlegIWR4c';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableStructure() {
  console.log("📊 Checking restaurants table structure...\n");

  try {
    // Get a sample restaurant to see the structure
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching sample restaurant:', error);
      return;
    }

    if (data) {
      console.log("Sample restaurant columns:");
      console.log("==========================");
      const columns = Object.keys(data);
      columns.forEach(col => {
        const value = data[col];
        const type = Array.isArray(value) ? 'array' : typeof value;
        console.log(`- ${col}: ${type}`);
      });
      
      console.log("\nSample data:");
      console.log("============");
      console.log("Name:", data.name);
      console.log("Address:", data.address);
      console.log("Cuisine:", data.cuisine);
      console.log("Rating:", data.rating);
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`\n📊 Total restaurants in database: ${count}`);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  } finally {
    process.exit(0);
  }
}

checkTableStructure();