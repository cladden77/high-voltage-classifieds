import { NextRequest, NextResponse } from 'next/server'
import { StripeConnect } from '@/lib/stripe'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'

interface CheckoutRequestBody {
  listingId: string
  successUrl?: string
  cancelUrl?: string
}

export async function POST(request: NextRequest) {
  try {
    // Get the current user from the session
    const cookieStore = await cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body: CheckoutRequestBody = await request.json()

    // Validate request body
    if (!body.listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    // Check if listing exists and is available
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, title, price, is_sold, seller_id')
      .eq('id', body.listingId)
      .single()

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.is_sold) {
      return NextResponse.json(
        { error: 'This item has already been sold' },
        { status: 400 }
      )
    }

    // Prevent sellers from buying their own items
    if (listing.seller_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot purchase your own listing' },
        { status: 400 }
      )
    }

    // Set default URLs if not provided
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const successUrl = body.successUrl || `${baseUrl}/listings/${body.listingId}?payment=success`
    const cancelUrl = body.cancelUrl || `${baseUrl}/listings/${body.listingId}?payment=cancelled`

    // Create checkout session
    const checkoutSession = await StripeConnect.createCheckoutSession({
      listingId: body.listingId,
      buyerId: user.id,
      successUrl,
      cancelUrl,
    })

    return NextResponse.json({
      success: true,
      data: {
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
        paymentIntentId: checkoutSession.paymentIntentId,
      },
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    
    const message = error instanceof Error ? error.message : 'Failed to create checkout session'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // This endpoint can be used to verify payment status
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Get the current user from the session
    const cookieStore = await cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // You can add logic here to verify the session belongs to the current user
    // and return payment status information

    return NextResponse.json({
      success: true,
      message: 'Checkout session verification endpoint',
      sessionId,
    })
  } catch (error) {
    console.error('Error verifying checkout session:', error)
    
    const message = error instanceof Error ? error.message : 'Failed to verify checkout session'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}