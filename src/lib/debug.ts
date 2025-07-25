import { createClientSupabase } from './supabase'
import { getCurrentUser } from './auth'

export const debugStorage = async () => {
  const supabase = createClientSupabase()
  
  console.log('=== SUPABASE DEBUG INFO ===')
  
  // Check authentication with more detail
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  const { data: session } = await supabase.auth.getSession()
  
  console.log('Auth Status:', {
    authenticated: !!user,
    userId: user?.id,
    email: user?.email,
    role: user?.role,
    sessionExists: !!session?.session,
    accessToken: !!session?.session?.access_token,
    authError: authError?.message
  })
  
  // Check storage bucket
  try {
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    console.log('Storage Buckets:', {
      buckets: buckets?.map(b => ({ id: b.id, name: b.name, public: b.public })),
      bucketsError: bucketsError?.message
    })
    
    // Check if listing-images bucket exists
    const listingImagesBucket = buckets?.find(b => b.id === 'listing-images')
    console.log('Listing Images Bucket:', {
      exists: !!listingImagesBucket,
      isPublic: listingImagesBucket?.public,
      bucket: listingImagesBucket
    })
    
    // Test bucket access
    if (listingImagesBucket) {
      const { data: files, error: filesError } = await supabase.storage
        .from('listing-images')
        .list('', { limit: 1 })
      
      console.log('Bucket List Test:', {
        canList: !filesError,
        filesError: filesError?.message,
        fileCount: files?.length || 0
      })
      
      // Test upload permission with a tiny test file
      if (user) {
        const testBlob = new Blob(['test'], { type: 'text/plain' })
        const testFile = new File([testBlob], 'debug-test.txt', { type: 'text/plain' })
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(`debug-test-${Date.now()}.txt`, testFile)
        
        console.log('Upload Permission Test:', {
          canUpload: !uploadError,
          uploadError: uploadError?.message,
          uploadData: uploadData
        })
        
        // Clean up test file if upload succeeded
        if (uploadData && !uploadError) {
          await supabase.storage
            .from('listing-images')
            .remove([uploadData.path])
          console.log('Test file cleaned up')
        }
      }
    }
  } catch (error) {
    console.error('Storage test failed:', error)
  }
  
  console.log('=== END DEBUG INFO ===')
  console.log('If you see RLS errors, run scripts/fix-storage-rls.sql in Supabase')
}

export const debugAuth = async () => {
  console.log('=== AUTH DEBUG ===')
  
  try {
    // Test getCurrentUser function
    const currentUser = await getCurrentUser()
    console.log('getCurrentUser result:', currentUser)
    
    // Test direct Supabase session
    const supabase = createClientSupabase()
    const { data: { session }, error } = await supabase.auth.getSession()
    console.log('Direct session check:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      error: error?.message
    })
    
    return {
      authWorking: !!currentUser && !!session,
      currentUser,
      session
    }
  } catch (error) {
    console.error('Auth debug failed:', error)
    return { authWorking: false, error }
  }
}

export const testImageUpload = async (file: File) => {
  const supabase = createClientSupabase()
  const fileName = `test-${Date.now()}-${file.name}`
  
  console.log('Testing image upload:', {
    fileName,
    fileSize: file.size,
    fileType: file.type
  })
  
  try {
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(fileName, file)
    
    if (error) {
      console.error('Upload test failed:', {
        message: error.message,
        error
      })
      return { success: false, error }
    }
    
    console.log('Upload test successful:', data)
    
    // Clean up test file
    await supabase.storage
      .from('listing-images')
      .remove([fileName])
    
    return { success: true, data }
  } catch (error) {
    console.error('Upload test exception:', error)
    return { success: false, error }
  }
} 