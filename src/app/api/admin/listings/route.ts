import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminSupabase } from '@/lib/supabase-server'
import { sanitizePostgrestOrFilterSearchTerm } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const search = new URL(request.url).searchParams.get('q')
    const supabase = createAdminSupabase()
    let query = supabase
      .from('listings')
      .select('id,title,price,status,is_sold,category,location,created_at,seller_id')
      .order('created_at', { ascending: false })
      .limit(200)

    const safeSearch = search ? sanitizePostgrestOrFilterSearchTerm(search) : ''
    if (safeSearch) {
      query = query.or(
        `title.ilike.%${safeSearch}%,category.ilike.%${safeSearch}%,location.ilike.%${safeSearch}%`
      )
    }

    const { data, error } = await query

    if (error) throw error
    return NextResponse.json({ listings: data || [] })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const listingId = body?.listingId as string
    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (body.status) updateData.status = body.status
    if (typeof body.isSold === 'boolean') updateData.is_sold = body.isSold

    const { error } = await createAdminSupabase()
      .from('listings')
      .update(updateData)
      .eq('id', listingId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const listingId = body?.listingId as string
    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 })
    }

    const { error } = await createAdminSupabase()
      .from('listings')
      .delete()
      .eq('id', listingId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
}
