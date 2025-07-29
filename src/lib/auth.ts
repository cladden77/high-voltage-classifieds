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
    
    const supabase = createClientSupabase()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role,
        }
      }
    })

    if (error || !data.user) {
      console.error('❌ Sign up error:', error?.message)
      return { success: false, error: error?.message }
    }

    console.log('✅ Auth signup successful, creating profile for:', data.user.id)
    console.log('🔍 Creating profile with role:', role)

    // Create user profile in database
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: email,
        full_name: name,
        role: role,
      })
      .select()

    if (profileError) {
      console.error('⚠️ Profile creation error:', profileError)
      console.error('Error details:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      })
      console.error('🔍 Attempted to create profile with role:', role)
      
      // If profile creation fails, try again with a delay (sometimes Supabase needs a moment)
      console.log('🔄 Retrying profile creation after delay...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('🔄 Retrying profile creation with role:', role)
      const { data: retryProfileData, error: retryError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: email,
          full_name: name,
          role: role,
        })
        .select()

      if (retryError) {
        console.error('❌ Profile creation retry failed:', retryError)
        console.error('🔍 Retry attempted with role:', role)
        // If profile creation fails, still return success since auth succeeded
      } else {
        console.log('✅ Profile created successfully on retry:', retryProfileData)
      }
    } else {
      console.log('✅ Profile created successfully:', profileData)
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
    
    const supabase = createClientSupabase()
    
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
    console.log('🔍 Fetching profile for user ID:', user.id)
    let { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('⚠️ Profile fetch error:', profileError)
      console.error('Error details:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      })
      
      // Try to create the profile if it doesn't exist
      if (profileError.code === 'PGRST116') { // No rows returned
        console.log('🔄 Profile not found, attempting to create...')
        console.log('🔍 User metadata:', user.user_metadata)
        
        // Try to determine the role from user metadata or default to buyer
        let defaultRole: 'buyer' | 'seller' = 'buyer'
        if (user.user_metadata?.role && (user.user_metadata.role === 'buyer' || user.user_metadata.role === 'seller')) {
          defaultRole = user.user_metadata.role as 'buyer' | 'seller'
        }
        
        console.log('🔍 Using default role:', defaultRole)
        
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

        if (createError) {
          console.error('❌ Profile creation failed:', createError)
        } else {
          console.log('✅ Profile created successfully:', newProfile)
          profile = newProfile
        }
      }
    }

    console.log('👤 User profile from DB:', profile)

    const currentUser = {
      id: user.id,
      email: user.email!,
      name: profile?.full_name || user.user_metadata?.full_name || '',
      role: profile?.role || 'buyer',
    }

    console.log('✅ Final current user object:', currentUser)
    console.log('🔍 Role detection:', {
      profileRole: profile?.role,
      defaultRole: 'buyer',
      finalRole: currentUser.role
    })
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
    const supabase = createClientSupabase()
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
export async function createUserProfile(userId: string, email: string, name: string, role: 'buyer' | 'seller' = 'buyer') {
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
} 