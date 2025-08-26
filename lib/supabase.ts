import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/integrations/supabase/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sixzqokachwkcvsqpxoq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeHpxb2thY2h3a2N2c3FweG9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzc5NTUsImV4cCI6MjA1NzY1Mzk1NX0.7oUA3DNoEjihJ4eR9yNpTX3OeMT--uYTIZoN7o54goM'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)