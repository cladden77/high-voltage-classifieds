import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminSupabase } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const search = new URL(request.url).searchParams.get('q')
    const supabase = createAdminSupabase()

    let query = supabase
      .from('users')
      .select('id,email,full_name,role,can_sell,seller_verified,created_at')
      .order('created_at', { ascending: false })
      .limit(200)

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ users: data || [] })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const userId = body?.userId as string
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (body.role) updateData.role = body.role
    if (typeof body.canSell === 'boolean') updateData.can_sell = body.canSell
    if (typeof body.sellerVerified === 'boolean') updateData.seller_verified = body.sellerVerified

    const { error } = await createAdminSupabase()
      .from('users')
      .update(updateData)
      .eq('id', userId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
}
