import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'
import { calculateListingFee } from '@/lib/listing-fees'
import { createAdminSupabase } from '@/lib/supabase-server'
import { StripeConnect } from '@/lib/stripe'

interface ListingPayload {
  title: string
  description: string
  price: number
  location: string
  category: string
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  image_urls: string[]
}

const LISTING_CONDITIONS: ListingPayload['condition'][] = [
  'new',
  'like_new',
  'good',
  'fair',
  'poor',
]

function parseListingPayload(value: unknown): ListingPayload | null {
  if (!value || typeof value !== 'object') return null
  const o = value as Record<string, unknown>

  if (typeof o.title !== 'string' || !o.title.trim()) return null
  if (typeof o.description !== 'string' || !o.description.trim()) return null
  if (typeof o.price !== 'number' || !Number.isFinite(o.price) || o.price < 0) return null
  if (typeof o.location !== 'string' || !o.location.trim()) return null
  if (typeof o.category !== 'string' || !o.category.trim()) return null

  const condition = o.condition
  if (typeof condition !== 'string' || !LISTING_CONDITIONS.includes(condition as ListingPayload['condition'])) {
    return null
  }

  if (!Array.isArray(o.image_urls) || !o.image_urls.every((u) => typeof u === 'string')) {
    return null
  }

  return {
    title: o.title.trim(),
    description: o.description.trim(),
    price: o.price,
    location: o.location.trim(),
    category: o.category.trim(),
    condition: condition as ListingPayload['condition'],
    image_urls: o.image_urls as string[],
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const body = await request.json()
    const listing = parseListingPayload(body?.listing)
    if (!listing) {
      return NextResponse.json({ error: 'Invalid listing payload' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('can_sell,seller_verified')
      .eq('id', user.id)
      .single()

    if (!profile?.can_sell || !profile?.seller_verified) {
      return NextResponse.json({ error: 'Seller account must be verified before listing.' }, { status: 403 })
    }

    const feeAmount = calculateListingFee(listing.price)
    const admin = createAdminSupabase()

    const { data: createdListing, error: listingError } = await admin
      .from('listings')
      .insert({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        location: listing.location,
        category: listing.category,
        condition: listing.condition,
        image_urls: listing.image_urls,
        seller_id: user.id,
        is_sold: false,
        status: feeAmount > 0 ? 'draft' : 'active',
        listing_fee_amount: feeAmount,
        listing_fee_status: feeAmount > 0 ? 'pending' : 'free',
        listing_fee_paid_at: feeAmount > 0 ? null : new Date().toISOString(),
      })
      .select()
      .single()

    if (listingError || !createdListing) {
      return NextResponse.json({ error: listingError?.message || 'Failed to create listing' }, { status: 500 })
    }

    const { data: feeRecord, error: feeError } = await admin
      .from('listing_fees')
      .insert({
        seller_id: user.id,
        listing_id: createdListing.id,
        listed_price: listing.price,
        fee_amount: feeAmount,
        status: feeAmount > 0 ? 'pending' : 'free',
      })
      .select()
      .single()

    if (feeError || !feeRecord) {
      return NextResponse.json({ error: feeError?.message || 'Failed to create fee record' }, { status: 500 })
    }

    await admin
      .from('listings')
      .update({ listing_fee_payment_id: feeRecord.id })
      .eq('id', createdListing.id)

    if (feeAmount === 0) {
      return NextResponse.json({
        success: true,
        status: 'active',
        listingId: createdListing.id,
        feeAmount,
      })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const checkout = await StripeConnect.createListingFeeCheckoutSession({
      sellerId: user.id,
      listingFeeId: feeRecord.id,
      listingPrice: listing.price,
      feeAmount,
      successUrl: `${baseUrl}/dashboard?tab=listings&listing_fee=success&listing_id=${createdListing.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/dashboard/create-listing?listing_fee=cancelled&listing_id=${createdListing.id}`,
    })

    await admin
      .from('listing_fees')
      .update({ stripe_checkout_session_id: checkout.id })
      .eq('id', feeRecord.id)

    return NextResponse.json({
      success: true,
      status: 'pending_payment',
      listingId: createdListing.id,
      feeAmount,
      checkoutUrl: checkout.url,
      sessionId: checkout.id,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
