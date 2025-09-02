import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, listingId, buyerId, sellerId } = body

    console.log('🔍 Debug endpoint called:', { action, listingId, buyerId, sellerId })

    const supabase = createAdminSupabase()

    switch (action) {
      case 'check_listing':
        {
          const { data, error } = await supabase
            .from('listings')
            .select('*')
            .eq('id', listingId)
            .single()

          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
          }

          return NextResponse.json({ 
            success: true, 
            listing: data,
            isSold: data.is_sold
          })
        }

      case 'check_orders':
        {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('listing_id', listingId)
            .eq('buyer_id', buyerId)
            .order('created_at', { ascending: false })

          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
          }

          return NextResponse.json({ 
            success: true, 
            orders: data,
            count: data.length
          })
        }

      case 'manual_update':
        {
          // Update order status
          const { data: orderUpdate, error: orderError } = await supabase
            .from('orders')
            .update({ 
              status: 'paid',
              updated_at: new Date().toISOString()
            })
            .eq('listing_id', listingId)
            .eq('buyer_id', buyerId)
            .eq('status', 'pending')
            .select()

          if (orderError) {
            console.error('❌ Order update error:', orderError)
          } else {
            console.log('✅ Order updated:', orderUpdate)
          }

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
          } else {
            console.log('✅ Listing marked as sold:', listingUpdate)
          }

          return NextResponse.json({ 
            success: true, 
            orderUpdate, 
            listingUpdate,
            orderError: orderError?.message,
            listingError: listingError?.message
          })
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Debug endpoint error:', error)
    return NextResponse.json(
      { error: 'Debug endpoint failed' },
      { status: 400 }
    )
  }
}
