import { NextRequest, NextResponse } from 'next/server'
import { StripeConnect } from '@/lib/stripe'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'

export async function POST(request: NextRequest) {
  try {
    // Get the current user from the session
    const cookieStore = await cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile to check role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role, stripe_account_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Only allow sellers to create Stripe accounts
    if (userProfile.role !== 'seller') {
      return NextResponse.json(
        { error: 'Only sellers can create Stripe accounts' },
        { status: 403 }
      )
    }

    // Create or retrieve Stripe Connect account
    const accountData = await StripeConnect.getOrCreateStripeAccount(user.id)

    return NextResponse.json({
      success: true,
      data: {
        stripeAccountId: accountData.stripeAccountId,
        onboardingUrl: accountData.onboardingUrl,
        isComplete: accountData.isComplete,
      },
    })
  } catch (error) {
    console.error('Error creating Stripe account:', error)
    
    const message = error instanceof Error ? error.message : 'Failed to create Stripe account'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the current user from the session
    const cookieStore = await cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('stripe_account_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    if (!userProfile.stripe_account_id) {
      return NextResponse.json({
        success: true,
        data: {
          hasStripeAccount: false,
          isComplete: false,
        },
      })
    }

    // Check account status
    const accountStatus = await StripeConnect.getAccountStatus(userProfile.stripe_account_id)

    return NextResponse.json({
      success: true,
      data: {
        hasStripeAccount: true,
        stripeAccountId: userProfile.stripe_account_id,
        isComplete: accountStatus.isOnboarded,
        charges_enabled: accountStatus.charges_enabled,
        payouts_enabled: accountStatus.payouts_enabled,
        requirements: accountStatus.requirements,
      },
    })
  } catch (error) {
    console.error('Error fetching Stripe account status:', error)
    
    const message = error instanceof Error ? error.message : 'Failed to fetch account status'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}