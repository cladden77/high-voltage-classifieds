import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listingId } = body

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
    }

    const supabase = createAdminSupabase()

    console.log('🧹 Cleaning up test orders for listing:', listingId)

    // Delete all test orders for this listing
    const { data: deletedOrders, error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('listing_id', listingId)
      .eq('payment_intent_id', 'test_payment_intent')
      .select()

    if (deleteError) {
      console.error('❌ Error deleting test orders:', deleteError)
      return NextResponse.json({ error: 'Failed to delete test orders', details: deleteError }, { status: 500 })
    }

    console.log('✅ Deleted test orders:', deletedOrders?.length || 0)

    // Reset listing to not sold
    const { data: listingUpdate, error: listingError } = await supabase
      .from('listings')
      .update({ 
        is_sold: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', listingId)
      .select()

    if (listingError) {
      console.error('❌ Error resetting listing:', listingError)
      return NextResponse.json({ error: 'Failed to reset listing', details: listingError }, { status: 500 })
    }

    console.log('✅ Reset listing to not sold:', listingUpdate)

    return NextResponse.json({
      success: true,
      message: 'Test data cleaned up successfully',
      deletedOrdersCount: deletedOrders?.length || 0,
      listingUpdate
    })

  } catch (error) {
    console.error('❌ Cleanup error:', error)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
