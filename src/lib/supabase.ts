import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './database.types'

// Client-side Supabase client (for client components)
export const createClientSupabase = () => 
  createClientComponentClient<Database>()

// General client for non-authenticated operations - lazy initialization
export const createGeneralSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  LISTING_IMAGES: 'listing-images'
} as const 