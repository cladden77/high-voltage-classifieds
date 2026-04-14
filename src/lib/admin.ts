import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

export async function getCurrentUserRole() {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, role: null as null | Database['public']['Tables']['users']['Row']['role'] }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  return { user, role: profile?.role ?? null }
}

export async function requireAdmin() {
  const { user, role } = await getCurrentUserRole()
  if (!user || role !== 'admin') {
    throw new Error('Admin access required')
  }
  return user
}
