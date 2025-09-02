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

    console.log('🧪 Manual test: Processing payment success for:', {
      listingId,
      buyerId,
      sellerId,
      paymentIntentId
    })

    // Update order status to paid
    const { data: orderUpdate, error: orderError } = await supabase
      .from('orders')
      .update({ 
        status: 'paid',
        payment_intent_id: paymentIntentId || 'test_payment_intent',
        updated_at: new Date().toISOString()
      })
      .eq('listing_id', listingId)
      .eq('buyer_id', buyerId)
      .eq('status', 'pending')
      .select()

    if (orderError) {
      console.error('❌ Manual test - Order update error:', orderError)
      return NextResponse.json({ error: 'Order update failed', details: orderError }, { status: 500 })
    }

    console.log('✅ Manual test - Order updated:', orderUpdate)

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
      console.error('❌ Manual test - Listing update error:', listingError)
      return NextResponse.json({ error: 'Listing update failed', details: listingError }, { status: 500 })
    }

    console.log('✅ Manual test - Listing marked as sold:', listingUpdate)

    return NextResponse.json({
      success: true,
      message: 'Manual test completed successfully',
      orderUpdate,
      listingUpdate
    })

  } catch (error) {
    console.error('❌ Manual test error:', error)
    return NextResponse.json({ error: 'Manual test failed' }, { status: 500 })
  }
}
