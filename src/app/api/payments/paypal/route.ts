import { NextRequest, NextResponse } from 'next/server'
import { PayPalPayments, validatePaymentData } from '@/lib/payments'
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

    // Create PayPal order
    const order = await PayPalPayments.createOrder(body)

    // Store payment record in database
    const supabase = createAdminSupabase()
    const { error } = await supabase
      .from('payments')
      .insert({
        listing_id: body.listingId,
        buyer_id: body.buyerId,
        seller_id: body.sellerId,
        amount: body.amount,
        payment_method: 'paypal',
        payment_intent_id: order.id,
        status: 'pending',
      })

    if (error) {
      console.error('Error storing payment record:', error)
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      approvalUrl: order.approval_url,
    })
  } catch (error) {
    console.error('Error processing PayPal payment:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}

// Capture PayPal order
export async function PUT(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID required' },
        { status: 400 }
      )
    }

    const captureResult = await PayPalPayments.captureOrder(orderId)

    // Update payment status in database
    const supabase = createAdminSupabase()
    if (captureResult.status === 'COMPLETED') {
      await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('payment_intent_id', orderId)
      
      // Mark listing as sold
      const paymentRecord = await supabase
        .from('payments')
        .select('listing_id')
        .eq('payment_intent_id', orderId)
        .single()

      if (paymentRecord.data) {
        await supabase
          .from('listings')
          .update({ is_sold: true })
          .eq('id', paymentRecord.data.listing_id)
      }
    }

    return NextResponse.json({
      success: true,
      capture: captureResult,
    })
  } catch (error) {
    console.error('Error capturing PayPal order:', error)
    return NextResponse.json(
      { error: 'Failed to capture payment' },
      { status: 500 }
    )
  }
} 