import { createClient } from '@supabase/supabase-js'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

// Server-side Supabase client (for server components)
// Note: This function is for Server Components. For API routes, use the inline pattern:
// const cookieStore = await cookies()
// const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
export const createServerSupabase = () => 
  createServerComponentClient<Database>({ cookies })

// Admin client (with service role key for server-side admin operations)
export const createAdminSupabase = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
} 