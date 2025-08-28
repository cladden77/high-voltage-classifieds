import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = createAdminSupabase()

    // Test creating a notification using the RPC function
    try {
      const { data: notificationId, error: rpcError } = await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_title: 'Test Notification',
        p_message: 'This is a test notification to verify the system is working correctly.',
        p_type: 'info',
        p_related_id: 'test-123',
        p_related_type: 'test'
      })

      if (rpcError) {
        console.error('❌ RPC function error:', rpcError)
        return NextResponse.json({ 
          error: 'Failed to create notification via RPC function',
          details: rpcError.message 
        }, { status: 500 })
      }

      console.log('✅ Test notification created via RPC:', notificationId)

      // Verify the notification was actually created
      const { data: notification, error: verifyError } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .single()

      if (verifyError || !notification) {
        console.error('❌ Verification failed:', verifyError)
        return NextResponse.json({ 
          error: 'Notification created but verification failed',
          details: verifyError?.message 
        }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true,
        notificationId,
        message: 'Test notification created successfully'
      })

    } catch (rpcError) {
      console.error('❌ RPC function exception:', rpcError)
      return NextResponse.json({ 
        error: 'Exception calling RPC function',
        details: rpcError instanceof Error ? rpcError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ Test notification API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
