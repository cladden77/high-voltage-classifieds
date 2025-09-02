import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listingId, buyerId, sellerId, paymentIntentId } = body

    console.log('🧪 Test webhook processing:', {
      listingId,
      buyerId,
      sellerId,
      paymentIntentId
    })

    const supabase = createAdminSupabase()

    // Update order status to paid
    const { data: orderUpdate, error: orderError } = await supabase
      .from('orders')
      .update({ 
        status: 'paid',
        payment_intent_id: paymentIntentId,
        updated_at: new Date().toISOString()
      })
      .eq('listing_id', listingId)
      .eq('buyer_id', buyerId)
      .eq('status', 'pending')
      .select()

    if (orderError) {
      console.error('❌ Order update error:', orderError)
      return NextResponse.json({ error: orderError.message }, { status: 400 })
    }

    console.log('✅ Order updated:', orderUpdate)

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
      console.error('❌ Listing update error:', listingError)
      return NextResponse.json({ error: listingError.message }, { status: 400 })
    }

    console.log('✅ Listing marked as sold:', listingUpdate)

    return NextResponse.json({ 
      success: true, 
      orderUpdate, 
      listingUpdate 
    })

  } catch (error) {
    console.error('❌ Test webhook error:', error)
    return NextResponse.json(
      { error: 'Test webhook processing failed' },
      { status: 400 }
    )
  }
}
