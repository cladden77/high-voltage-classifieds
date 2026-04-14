import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

export async function GET(request: NextRequest) {
  const listingId = new URL(request.url).searchParams.get('listing_id')
  if (!listingId) return NextResponse.json({ error: 'listing_id is required' }, { status: 400 })

  const cookieStore = await cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const { data: listing, error } = await supabase
    .from('listings')
    .select('id,seller_id,status,listing_fee_status')
    .eq('id', listingId)
    .single()

  if (error || !listing || listing.seller_id !== user.id) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    listingId: listing.id,
    status: listing.status,
    feeStatus: listing.listing_fee_status,
    active: listing.status === 'active',
  })
}
