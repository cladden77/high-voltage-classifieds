import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listingId, buyerId, sellerId, paymentIntentId } = body

    if (!listingId || !buyerId || !sellerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminSupabase()

    console.log('🧪 Simulating webhook call for:', {
      listingId,
      buyerId,
      sellerId,
      paymentIntentId
    })

    // Simulate what the webhook should do
    const { data: orderUpdate, error: orderError } = await supabase
      .from('orders')
      .update({ 
        status: 'paid',
        payment_intent_id: paymentIntentId || 'simulated_payment_intent',
        updated_at: new Date().toISOString()
      })
      .eq('listing_id', listingId)
      .eq('buyer_id', buyerId)
      .eq('status', 'pending')
      .select()

    if (orderError) {
      console.error('❌ Simulated webhook - Order update error:', orderError)
      return NextResponse.json({ error: 'Order update failed', details: orderError }, { status: 500 })
    }

    console.log('✅ Simulated webhook - Order updated:', orderUpdate)

    // Mark listing as sold
    const { data: listingUpdate, error: listingError } = await supabase
      .from('listings')
      .update({ 
        is_sold: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', listingId)
      .select()

    if (listingError) {
      console.error('❌ Simulated webhook - Listing update error:', listingError)
      return NextResponse.json({ error: 'Listing update failed', details: listingError }, { status: 500 })
    }

    console.log('✅ Simulated webhook - Listing marked as sold:', listingUpdate)

    return NextResponse.json({
      success: true,
      message: 'Simulated webhook completed successfully',
      orderUpdate,
      listingUpdate
    })

  } catch (error) {
    console.error('❌ Simulated webhook error:', error)
    return NextResponse.json({ error: 'Simulated webhook failed' }, { status: 500 })
  }
}
