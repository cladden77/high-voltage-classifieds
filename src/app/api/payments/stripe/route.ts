import { NextRequest, NextResponse } from 'next/server'
import { StripePayments, validatePaymentData } from '@/lib/payments'
import { createAdminSupabase } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate payment data
    if (!validatePaymentData(body)) {
      return NextResponse.json(
        { error: 'Invalid payment data' },
        { status: 400 }
      )
    }

    // Create payment intent with Stripe
    const paymentIntent = await StripePayments.createPaymentIntent(body)

    // Store order record in database
    const supabase = createAdminSupabase()
    const { error } = await supabase
      .from('orders')
      .insert({
        listing_id: body.listingId,
        buyer_id: body.buyerId,
        seller_id: body.sellerId,
        amount_paid: body.amount,
        payment_method: 'stripe',
        payment_intent_id: paymentIntent.id,
        status: 'pending',
      })

    if (error) {
      console.error('Error storing order record:', error)
    }

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
      },
    })
  } catch (error) {
    console.error('Error processing Stripe payment:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('payment_intent_id')

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID required' },
        { status: 400 }
      )
    }

    const paymentIntent = await StripePayments.confirmPayment(paymentIntentId)

    return NextResponse.json({
      success: true,
      paymentIntent,
    })
  } catch (error) {
    console.error('Error retrieving payment:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve payment' },
      { status: 500 }
    )
  }
} 