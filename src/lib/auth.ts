import { createGeneralSupabase } from './supabase'

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
  try {
    console.log('🔐 Signing in user:', email)
    
    const supabase = createGeneralSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      console.error('❌ Sign in error:', error?.message)
      return { success: false, error: error?.message }
    }

    console.log('✅ Auth successful, fetching profile for:', data.user.id)

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('⚠️ Profile fetch error:', profileError)
    }

    console.log('👤 User profile:', profile)

    const user = {
      id: data.user.id,
      email: data.user.email!,
      name: profile?.full_name || data.user.user_metadata?.full_name || '',
      role: profile?.role || role || 'buyer',
    }

    console.log('✅ Final user object:', user)

    return { 
      success: true, 
      user
    }
  } catch (error) {
    console.error('💥 Sign in exception:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function signUpWithCredentials(email: string, password: string, name: string, role: 'buyer' | 'seller') {
  try {
    console.log('📝 Signing up user:', email, 'as', role)
    
    const supabase = createGeneralSupabase()
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
      console.error('❌ Sign up error:', error?.message)
      return { success: false, error: error?.message }
    }

    console.log('✅ Auth signup successful, creating profile for:', data.user.id)

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
      console.error('⚠️ Profile creation error:', profileError)
      // If profile creation fails, still return success since auth succeeded
    } else {
      console.log('✅ Profile created successfully')
    }

    const user = {
      id: data.user.id,
      email: email,
      name: name,
      role: role,
    }

    console.log('✅ Final signup user object:', user)

    return { 
      success: true, 
      user
    }
  } catch (error) {
    console.error('💥 Sign up exception:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Function to get current user (client-side)
export async function getCurrentUser() {
  try {
    console.log('🔍 Getting current user...')
    
    const supabase = createGeneralSupabase()
    
    // First check if there's an active session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session check error:', sessionError)
      return null
    }

    if (!session) {
      console.log('ℹ️ No active session found')
      return null
    }

    // Now we can safely get the user since we have a session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Auth getUser error:', authError)
      return null
    }

    console.log('✅ Auth user found:', user.id, user.email)

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('⚠️ Profile fetch error:', profileError)
      // Continue with basic user data from auth
    }

    console.log('👤 User profile from DB:', profile)

    const currentUser = {
      id: user.id,
      email: user.email!,
      name: profile?.full_name || user.user_metadata?.full_name || '',
      role: profile?.role || 'buyer',
    }

    console.log('✅ Final current user object:', currentUser)
    return currentUser

  } catch (error) {
    console.error('💥 getCurrentUser exception:', error)
    return null
  }
}

// Function to sign out
export async function signOut() {
  try {
    console.log('🚪 Signing out user...')
    const supabase = createGeneralSupabase()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('❌ Sign out error:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Sign out successful')
    return { success: true }
  } catch (error) {
    console.error('💥 Sign out exception:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Function to safely check if user is authenticated
export async function isAuthenticated() {
  try {
    const supabase = createGeneralSupabase()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Session check error:', error)
      return false
    }

    return !!session
  } catch (error) {
    console.error('💥 isAuthenticated exception:', error)
    return false
  }
}

// Debug function to check auth state
export async function debugAuthState() {
  try {
    const supabase = createGeneralSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    const currentUser = await getCurrentUser()
    
    console.log('🔍 Auth Debug Info:')
    console.log('Session:', session)
    console.log('Current User:', currentUser)
    
    return { session, currentUser }
  } catch (error) {
    console.error('💥 Debug auth state error:', error)
    return { session: null, currentUser: null }
  }
}

// User type definitions
export interface User {
  id: string
  email: string
  name: string
  role: 'buyer' | 'seller'
} 