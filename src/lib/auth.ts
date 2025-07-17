import { createAdminSupabase } from './supabase-server'

// Basic auth configuration - will be enhanced once packages are compatible
export const authConfig = {
  providers: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }
  },
  database: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }
}

// User authentication functions
export async function signInWithCredentials(email: string, password: string, role?: 'buyer' | 'seller') {
  const supabase = createAdminSupabase()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return { success: false, error: error?.message }
  }

  // Get or create user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (!profile && role) {
    await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.full_name || '',
        role,
      })
  }

  return { 
    success: true, 
    user: {
      id: data.user.id,
      email: data.user.email!,
      name: profile?.name || data.user.user_metadata?.full_name || '',
      role: profile?.role || role || 'buyer',
    }
  }
}

export async function signUpWithCredentials(email: string, password: string, name: string, role: 'buyer' | 'seller') {
  const supabase = createAdminSupabase()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      }
    }
  })

  if (error || !data.user) {
    return { success: false, error: error?.message }
  }

  // Create user profile
  await supabase
    .from('users')
    .insert({
      id: data.user.id,
      email: email,
      name: name,
      role: role,
    })

  return { 
    success: true, 
    user: {
      id: data.user.id,
      email: email,
      name: name,
      role: role,
    }
  }
}

// User type definitions
export interface User {
  id: string
  email: string
  name: string
  role: 'buyer' | 'seller'
} 