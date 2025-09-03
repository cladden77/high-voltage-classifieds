import { NextRequest, NextResponse } from 'next/server'
import { createClientSupabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId, markAllRead } = body

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const supabase = createClientSupabase()

    console.log('🧪 Testing notification update for user:', user.id)

    if (markAllRead) {
      // Test mark all as read
      console.log('🧪 Attempting to mark all notifications as read...')
      
      // First, get all unread notifications
      const { data: unreadNotifications, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)

      console.log('🧪 Found unread notifications:', unreadNotifications)

      if (fetchError) {
        console.error('❌ Error fetching unread notifications:', fetchError)
        return NextResponse.json({ error: 'Failed to fetch notifications', details: fetchError }, { status: 500 })
      }

      // Try to update them
      const { data: updateResult, error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .select()

      console.log('🧪 Update result:', updateResult)

      if (updateError) {
        console.error('❌ Error updating notifications:', updateError)
        return NextResponse.json({ error: 'Failed to update notifications', details: updateError }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Mark all as read test completed',
        unreadCount: unreadNotifications?.length || 0,
        updatedCount: updateResult?.length || 0,
        updatedNotifications: updateResult
      })

    } else if (notificationId) {
      // Test single notification update
      console.log('🧪 Attempting to mark single notification as read:', notificationId)

      // First, get the notification
      const { data: notification, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .eq('user_id', user.id)
        .single()

      console.log('🧪 Found notification:', notification)

      if (fetchError) {
        console.error('❌ Error fetching notification:', fetchError)
        return NextResponse.json({ error: 'Failed to fetch notification', details: fetchError }, { status: 500 })
      }

      // Try to update it
      const { data: updateResult, error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)
        .select()

      console.log('🧪 Update result:', updateResult)

      if (updateError) {
        console.error('❌ Error updating notification:', updateError)
        return NextResponse.json({ error: 'Failed to update notification', details: updateError }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Single notification update test completed',
        originalNotification: notification,
        updatedNotification: updateResult?.[0]
      })
    }

    return NextResponse.json({ error: 'No test specified' }, { status: 400 })

  } catch (error) {
    console.error('❌ Test notification update error:', error)
    return NextResponse.json({ error: 'Test failed' }, { status: 500 })
  }
}
