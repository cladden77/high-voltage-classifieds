import { supabase } from './supabase'

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

// User authentication functions (for client components)
export async function signInWithCredentials(email: string, password: string, role?: 'buyer' | 'seller') {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return { success: false, error: error?.message }
  }

  // Get user profile from database
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single()

  return { 
    success: true, 
    user: {
      id: data.user.id,
      email: data.user.email!,
      name: profile?.full_name || data.user.user_metadata?.full_name || '',
      role: profile?.role || role || 'buyer',
    }
  }
}

export async function signUpWithCredentials(email: string, password: string, name: string, role: 'buyer' | 'seller') {
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

  // Create user profile in database
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: data.user.id,
      email: email,
      full_name: name,
      role: role,
    })

  if (profileError) {
    // If profile creation fails, still return success since auth succeeded
    console.error('Profile creation error:', profileError)
  }

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

// Function to get current user (client-side)
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email!,
    name: profile?.full_name || user.user_metadata?.full_name || '',
    role: profile?.role || 'buyer',
  }
}

// Function to sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { success: !error, error: error?.message }
}

// User type definitions
export interface User {
  id: string
  email: string
  name: string
  role: 'buyer' | 'seller'
} 