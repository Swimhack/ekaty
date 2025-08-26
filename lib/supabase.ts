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

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-client-info': 'ekaty-app',
    },
    fetch: (url, options = {}) => {
      // Add timeout and retry logic for Cloudflare issues
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 45000) // 45s timeout for CF
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }).finally(() => clearTimeout(timeoutId))
    },
  },
})