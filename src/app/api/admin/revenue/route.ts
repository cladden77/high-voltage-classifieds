import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminSupabase } from '@/lib/supabase-server'

export async function GET() {
  try {
    await requireAdmin()
    const supabase = createAdminSupabase()
    const { data, error } = await supabase
      .from('listing_fees')
      .select('id,seller_id,listing_id,listed_price,fee_amount,status,created_at')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) throw error
    return NextResponse.json({ listingFees: data || [] })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
}
