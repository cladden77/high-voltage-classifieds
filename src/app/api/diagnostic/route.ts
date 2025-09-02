import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabase()
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')

    console.log('🔍 Diagnostic: Checking database state for listing:', listingId)

    // Get all orders for this listing
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError)
      return NextResponse.json({ error: 'Failed to fetch orders', details: ordersError }, { status: 500 })
    }

    // Get listing details
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single()

    if (listingError) {
      console.error('❌ Error fetching listing:', listingError)
      return NextResponse.json({ error: 'Failed to fetch listing', details: listingError }, { status: 500 })
    }

    // Count orders by status
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log('📊 Diagnostic results:', {
      listingId,
      listingSold: listing.is_sold,
      totalOrders: orders.length,
      statusCounts,
      orders: orders.map(o => ({
        id: o.id,
        status: o.status,
        payment_intent_id: o.payment_intent_id,
        created_at: o.created_at
      }))
    })

    return NextResponse.json({
      success: true,
      diagnostic: {
        listingId,
        listingSold: listing.is_sold,
        totalOrders: orders.length,
        statusCounts,
        orders: orders.map(o => ({
          id: o.id,
          status: o.status,
          payment_intent_id: o.payment_intent_id,
          created_at: o.created_at
        }))
      }
    })

  } catch (error) {
    console.error('❌ Diagnostic error:', error)
    return NextResponse.json({ error: 'Diagnostic failed' }, { status: 500 })
  }
}
