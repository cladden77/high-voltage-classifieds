import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminSupabase } from '@/lib/supabase-server'

export async function GET() {
  try {
    await requireAdmin()
    const supabase = createAdminSupabase()

    const [listingsRes, ordersRes, feesRes] = await Promise.all([
      supabase.from('listings').select('id,status,is_sold,price', { count: 'exact' }),
      supabase.from('orders').select('id,amount_paid,status', { count: 'exact' }),
      supabase.from('listing_fees').select('id,fee_amount,status', { count: 'exact' }),
    ])

    const listings = listingsRes.data || []
    const orders = ordersRes.data || []
    const fees = feesRes.data || []

    return NextResponse.json({
      totals: {
        listings: listingsRes.count || 0,
        activeListings: listings.filter((item) => item.status === 'active').length,
        soldListings: listings.filter((item) => item.is_sold).length,
        totalSales: orders.filter((item) => item.status === 'paid').length,
        gmv: orders.filter((item) => item.status === 'paid').reduce((sum, item) => sum + Number(item.amount_paid), 0),
        listingFeeIncome: fees.filter((item) => item.status === 'paid' || item.status === 'free').reduce((sum, item) => sum + Number(item.fee_amount), 0),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
}
