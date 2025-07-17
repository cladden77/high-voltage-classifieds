import { NextRequest, NextResponse } from 'next/server'
import { StripePayments } from '@/lib/payments'
import { createAdminSupabase } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const event = await StripePayments.handleWebhook(body, signature)
    const supabase = createAdminSupabase()

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        {
          const paymentIntent = event.data.object
          
          // Update payment status to completed
          await supabase
            .from('payments')
            .update({ status: 'completed' })
            .eq('payment_intent_id', paymentIntent.id)

          // Mark listing as sold
          const paymentRecord = await supabase
            .from('payments')
            .select('listing_id')
            .eq('payment_intent_id', paymentIntent.id)
            .single()

          if (paymentRecord.data) {
            await supabase
              .from('listings')
              .update({ is_sold: true })
              .eq('id', paymentRecord.data.listing_id)
          }

          console.log('Payment succeeded:', paymentIntent.id)
        }
        break

      case 'payment_intent.payment_failed':
        {
          const paymentIntent = event.data.object
          
          // Update payment status to failed
          await supabase
            .from('payments')
            .update({ status: 'failed' })
            .eq('payment_intent_id', paymentIntent.id)

          console.log('Payment failed:', paymentIntent.id)
        }
        break

      case 'payment_intent.canceled':
        {
          const paymentIntent = event.data.object
          
          // Update payment status to canceled
          await supabase
            .from('payments')
            .update({ status: 'cancelled' })
            .eq('payment_intent_id', paymentIntent.id)

          console.log('Payment canceled:', paymentIntent.id)
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
} 