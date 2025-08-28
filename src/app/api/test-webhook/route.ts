import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, testType } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = createAdminSupabase()

    // Test different notification types
    let notificationId
    let error

    switch (testType) {
      case 'message':
        // Test message notification
        const result = await supabase.rpc('create_notification', {
          p_user_id: userId,
          p_title: 'Test Message Notification',
          p_message: 'This is a test message notification to verify the system is working.',
          p_type: 'info',
          p_related_id: 'test-message-123',
          p_related_type: 'message'
        })
        notificationId = result.data
        error = result.error
        break

      case 'sold':
        // Test sold item notification
        const soldResult = await supabase.rpc('create_notification', {
          p_user_id: userId,
          p_title: 'Test Sold Item Notification',
          p_message: 'This is a test sold item notification to verify the system is working.',
          p_type: 'success',
          p_related_id: 'test-listing-123',
          p_related_type: 'listing'
        })
        notificationId = soldResult.data
        error = soldResult.error
        break

      default:
        // Test general notification
        const generalResult = await supabase.rpc('create_notification', {
          p_user_id: userId,
          p_title: 'Test Notification',
          p_message: 'This is a test notification to verify the system is working.',
          p_type: 'info',
          p_related_id: 'test-123',
          p_related_type: 'test'
        })
        notificationId = generalResult.data
        error = generalResult.error
    }

    if (error) {
      console.error('❌ Test webhook notification error:', error)
      return NextResponse.json({ 
        error: 'Failed to create test notification',
        details: error.message 
      }, { status: 500 })
    }

    console.log('✅ Test webhook notification created:', notificationId)

    return NextResponse.json({ 
      success: true,
      notificationId,
      testType,
      message: 'Test webhook notification created successfully'
    })

  } catch (error: any) {
    console.error('❌ Test webhook error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
