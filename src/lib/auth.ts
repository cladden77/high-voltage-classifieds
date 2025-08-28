import { createClientSupabase } from './supabase'

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
    
    const supabase = createClientSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      console.error('❌ Sign in error:', error?.message)
      return { success: false, error: error?.message }
    }

    // Check if email is verified
    if (!data.user.email_confirmed_at) {
      console.log('⚠️ Email not verified for user:', data.user.id)
      return { 
        success: false, 
        error: 'Please check your email and click the verification link before signing in.' 
      }
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
      canSell: profile?.can_sell || false,
      sellerVerified: profile?.seller_verified || false,
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

export async function signUpWithCredentials(email: string, password: string, name: string, canSell: boolean = false) {
  try {
    const supabase = createClientSupabase()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          can_sell: canSell,
        }
      }
    })

    if (error || !data.user) {
      return { success: false, error: error?.message }
    }

    // Create user profile in database - all users start as buyers with optional seller capabilities
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: email,
        full_name: name,
        role: 'buyer', // All users start as buyers
        can_sell: canSell,
        seller_verified: false, // Will be verified after Stripe Connect onboarding
      })
      .select()

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError)
      
      // If profile creation fails, try again with a delay (sometimes Supabase needs a moment)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: retryProfileData, error: retryError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: email,
          full_name: name,
          role: 'buyer',
          can_sell: canSell,
          seller_verified: false,
        })
        .select()

      if (retryError) {
        console.error('❌ Profile creation retry failed:', retryError)
        // If profile creation fails, still return success since auth succeeded
      } else {
        console.log('✅ Profile created on retry:', retryProfileData)
      }
    } else {
      console.log('✅ Profile created successfully:', profileData)
    }

    const user = {
      id: data.user.id,
      email: email,
      name: name,
      role: 'buyer', // All users start as buyers
      canSell: canSell,
    }

    return { 
      success: true, 
      user
    }
  } catch (error) {
    console.error('💥 SignUpWithCredentials exception:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

// Function to get current user (client-side)
export async function getCurrentUser() {
  try {
    const supabase = createClientSupabase()
    
    // First check if there's an active session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return null
    }

    // Now we can safely get the user since we have a session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return null
    }

    // Get user profile
    let { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      // Try to create the profile if it doesn't exist
      if (profileError.code === 'PGRST116') { // No rows returned
        // Try to determine the role from user metadata or default to buyer
        let defaultRole: 'buyer' | 'seller' = 'buyer'
        if (user.user_metadata?.role && (user.user_metadata.role === 'buyer' || user.user_metadata.role === 'seller')) {
          defaultRole = user.user_metadata.role as 'buyer' | 'seller'
        }
        
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || '',
            role: defaultRole,
          })
          .select()
          .single()

        if (!createError) {
          profile = newProfile
        }
      }
    }

    const currentUser = {
      id: user.id,
      email: user.email!,
      name: profile?.full_name || user.user_metadata?.full_name || '',
      role: profile?.role || 'buyer',
      canSell: profile?.can_sell || false,
      sellerVerified: profile?.seller_verified || false,
    }

    return currentUser

  } catch (error) {
    return null
  }
}

// Function to sign out
export async function signOut() {
  try {
    const supabase = createClientSupabase()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Function to safely check if user is authenticated
export async function isAuthenticated() {
  try {
    const supabase = createClientSupabase()
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
    const supabase = createClientSupabase()
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

// Utility function to manually create/fix user profile
export async function createUserProfile(userId: string, email: string, name: string, role: 'buyer' | 'seller' = 'buyer', canSell: boolean = false) {
  try {
    console.log('🔧 Creating/fixing user profile for:', userId)
    
    const supabase = createClientSupabase()
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: email,
        full_name: name,
        role: role,
        can_sell: canSell,
        seller_verified: canSell && role === 'seller',
      })
      .select()

    if (error) {
      console.error('❌ Profile creation/fix failed:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Profile created/fixed successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('💥 Profile creation/fix exception:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// User type definitions
export interface User {
  id: string
  email: string
  name: string
  role: 'buyer' | 'seller'
  canSell?: boolean
  sellerVerified?: boolean
} 