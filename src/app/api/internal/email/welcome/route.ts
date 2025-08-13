import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'
import { createAdminSupabase } from '@/lib/supabase-server'
import { sendWelcomeEmail } from '@/lib/email/send'

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Load profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, full_name, welcome_email_sent')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ ok: false, error: 'Profile not found' }, { status: 404 })
    }

    // If already sent, noop
    if ((profile as any).welcome_email_sent === true) {
      return NextResponse.json({ ok: true, alreadySent: true })
    }

    // Send email
    await sendWelcomeEmail({ to: profile.email, firstName: profile.full_name || undefined })

    // Mark as sent using admin to bypass any RLS edge cases
    const admin = createAdminSupabase()
    await admin
      .from('users')
      .update({ welcome_email_sent: true })
      .eq('id', user.id)

    return NextResponse.json({ ok: true, sent: true })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Failed' }, { status: 500 })
  }
}



