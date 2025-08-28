import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createAdminSupabase } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listing_id, message_text, recipient_id } = body || {}

    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!listing_id || !message_text || !recipient_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Validate that the listing exists
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, seller_id, title')
      .eq('id', listing_id)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Validate that the recipient exists using admin client to bypass RLS
    const admin = createAdminSupabase()
    const { data: recipient, error: recipientError } = await admin
      .from('users')
      .select('id, email, full_name')
      .eq('id', recipient_id)
      .single()

    if (recipientError || !recipient) {
      return NextResponse.json({ 
        error: 'Recipient user not found. This may be due to a data integrity issue. Please contact support.' 
      }, { status: 404 })
    }

    // Insert message
    const { data: inserted, error: insertError } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        recipient_id,
        listing_id,
        message_text,
        is_read: false,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    // Create notification for recipient about new message
    try {
      const admin = createAdminSupabase()
      await admin.rpc('create_notification', {
        p_user_id: recipient_id,
        p_title: 'New Message Received',
        p_message: `You have a new message about "${listing.title}" from ${user.user_metadata?.full_name || 'A user'}.`,
        p_type: 'info',
        p_related_id: inserted.id,
        p_related_type: 'message'
      })
      console.log('✅ Message notification created for recipient')
    } catch (notifError) {
      console.error('❌ Error creating message notification:', notifError)
      // Don't fail the message creation if notification fails
    }

    // Try to send email notification (optional - don't fail if email fails)
    try {
      const { sendNewMessageEmail } = await import('@/lib/email/send')
      
      // Send email notification
      try {
        await sendNewMessageEmail({
          to: recipient.email,
          recipientName: recipient.full_name || undefined,
          senderName: user.user_metadata?.full_name || 'A user',
          preview: message_text,
          conversationId: listing_id
        })
      } catch (emailError) {
        // Log email errors but don't fail the message creation
        console.error('Failed to send email notification:', emailError)
      }

    } catch (emailError) {
      // Email failure is non-critical, but log it for debugging
      console.error('❌ Email sending failed:', {
        error: emailError,
        recipient: recipient.email,
        message: message_text.slice(0, 50) + '...'
      })
    }

    return NextResponse.json({ 
      success: true,
      data: inserted,
      message: 'Message sent successfully'
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Internal server error. Please try again.' 
    }, { status: 500 })
  }
}



