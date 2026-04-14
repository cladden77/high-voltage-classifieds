import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'
import { createAdminSupabase } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

/**
 * After Stripe Checkout redirect, activate the listing without waiting for webhooks.
 * Idempotent: safe to call multiple times.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabaseAuth = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const sessionId = body?.session_id as string | undefined
    if (!sessionId) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.metadata?.purpose !== 'listing_fee') {
      return NextResponse.json({ error: 'Not a listing fee checkout session' }, { status: 400 })
    }

    const sellerId = session.metadata.seller_id
    const listingFeeId = session.metadata.listing_fee_id
    if (!sellerId || !listingFeeId) {
      return NextResponse.json({ error: 'Missing session metadata' }, { status: 400 })
    }

    if (sellerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const isPaid =
      session.payment_status === 'paid' || session.payment_status === 'no_payment_required'
    if (!isPaid) {
      return NextResponse.json({
        success: true,
        activated: false,
        payment_status: session.payment_status,
      })
    }

    const admin = createAdminSupabase()

    const { data: feeRecord, error: feeFetchError } = await admin
      .from('listing_fees')
      .select('id, listing_id, status')
      .eq('id', listingFeeId)
      .single()

    if (feeFetchError || !feeRecord) {
      return NextResponse.json({ error: 'Listing fee record not found' }, { status: 404 })
    }

    if (feeRecord.status !== 'paid') {
      const { error: feeUpdateError } = await admin
        .from('listing_fees')
        .update({
          status: 'paid',
          stripe_payment_intent_id:
            typeof session.payment_intent === 'string' ? session.payment_intent : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listingFeeId)

      if (feeUpdateError) {
        console.error('fee-finalize: listing_fees update error', feeUpdateError)
        return NextResponse.json({ error: feeUpdateError.message }, { status: 500 })
      }
    }

    if (feeRecord.listing_id) {
      const { error: listingUpdateError } = await admin
        .from('listings')
        .update({
          status: 'active',
          listing_fee_status: 'paid',
          listing_fee_paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', feeRecord.listing_id)
        .eq('seller_id', sellerId)

      if (listingUpdateError) {
        console.error('fee-finalize: listings update error', listingUpdateError)
        return NextResponse.json({ error: listingUpdateError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      activated: true,
      listingId: feeRecord.listing_id,
    })
  } catch (error) {
    console.error('fee-finalize error', error)
    const message = error instanceof Error ? error.message : 'Failed to finalize listing fee'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
