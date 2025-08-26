import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/integrations/supabase/types'

// Environment variables must be set in production - no fallbacks to prevent configuration errors
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)