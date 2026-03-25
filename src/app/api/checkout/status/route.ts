import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createAdminSupabase } from '@/lib/supabase-server'
import { Database } from '@/lib/database.types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const listingId = session.metadata?.listing_id
    const buyerId = session.metadata?.buyer_id

    if (!listingId || !buyerId) {
      return NextResponse.json({ finalized: false, reason: 'Missing session metadata' })
    }

    if (buyerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminSupabase = createAdminSupabase()

    const [{ data: orderData, error: orderError }, { data: listingData, error: listingError }] =
      await Promise.all([
        adminSupabase
          .from('orders')
          .select('id, status, payment_intent_id, updated_at')
          .eq('listing_id', listingId)
          .eq('buyer_id', buyerId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        adminSupabase.from('listings').select('id, is_sold, updated_at').eq('id', listingId).maybeSingle(),
      ])

    if (orderError || listingError) {
      return NextResponse.json(
        {
          finalized: false,
          reason: 'Database query failed',
          orderError: orderError?.message,
          listingError: listingError?.message,
        },
        { status: 500 }
      )
    }

    const finalized = !!(orderData && orderData.status === 'paid' && listingData?.is_sold)

    return NextResponse.json({
      finalized,
      paymentStatus: session.payment_status,
      orderStatus: orderData?.status || null,
      listingSold: listingData?.is_sold || false,
    })
  } catch (error) {
    console.error('Error checking checkout status:', error)
    return NextResponse.json({ error: 'Failed to check checkout status' }, { status: 500 })
  }
}
