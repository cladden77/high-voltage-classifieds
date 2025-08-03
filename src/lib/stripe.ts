import Stripe from 'stripe'
import { createAdminSupabase } from './supabase-server'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export interface ConnectAccountData {
  stripeAccountId: string
  onboardingUrl: string
  isComplete: boolean
}

export interface CheckoutData {
  listingId: string
  buyerId: string
  successUrl: string
  cancelUrl: string
}

export interface CheckoutSession {
  id: string
  url: string
  paymentIntentId?: string
}

// Stripe Connect Integration
export class StripeConnect {
  /**
   * Create or retrieve a Stripe Connect Express account for a seller
   * @param userId - The user ID from your database
   * @returns Promise with account data and onboarding URL
   */
  static async getOrCreateStripeAccount(userId: string): Promise<ConnectAccountData> {
    try {
      const supabase = createAdminSupabase()
      
      // First, check if user already has a Stripe account
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('stripe_account_id, email, full_name')
        .eq('id', userId)
        .single()

      if (userError) {
        throw new Error(`Failed to fetch user: ${userError.message}`)
      }

      let stripeAccountId = user.stripe_account_id

      // If no Stripe account exists, create one
      if (!stripeAccountId) {
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'US', // You can make this dynamic based on user location
          email: user.email,
          metadata: {
            user_id: userId,
          },
        })

        stripeAccountId = account.id

        // Save the Stripe account ID to the database
        const { error: updateError } = await supabase
          .from('users')
          .update({ stripe_account_id: stripeAccountId })
          .eq('id', userId)

        if (updateError) {
          throw new Error(`Failed to save Stripe account ID: ${updateError.message}`)
        }
      }

      // Create account link for onboarding
      // Ensure we have a valid base URL for redirects
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      
      // Validate that the base URL starts with http or https
      if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        throw new Error('NEXT_PUBLIC_BASE_URL must start with http:// or https://')
      }
      
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: `${baseUrl}/dashboard?stripe_refresh=true`,
        return_url: `${baseUrl}/dashboard?stripe_onboarding=complete`,
        type: 'account_onboarding',
      })

      // Check if account is fully onboarded
      const account = await stripe.accounts.retrieve(stripeAccountId)
      const isComplete = account.details_submitted && !account.requirements?.disabled_reason

      return {
        stripeAccountId,
        onboardingUrl: accountLink.url,
        isComplete,
      }
    } catch (error) {
      console.error('Error creating/retrieving Stripe account:', error)
      throw new Error('Failed to setup Stripe account')
    }
  }

  /**
   * Create a Checkout Session with direct payment to seller (no platform fee)
   * @param checkoutData - Checkout session data
   * @returns Promise with checkout session details
   */
  static async createCheckoutSession(checkoutData: CheckoutData): Promise<CheckoutSession> {
    try {
      const supabase = createAdminSupabase()

      // Get listing and seller information
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          price,
          seller_id,
          users!listings_seller_id_fkey (
            stripe_account_id,
            email,
            full_name
          )
        `)
        .eq('id', checkoutData.listingId)
        .single()

      if (listingError || !listing) {
        throw new Error('Listing not found')
      }

      const seller = listing.users as any
      if (!seller?.stripe_account_id) {
        throw new Error('Seller has not set up their Stripe account')
      }

      // Verify the seller's account is ready
      const account = await stripe.accounts.retrieve(seller.stripe_account_id)
      if (!account.details_submitted || account.requirements?.disabled_reason) {
        throw new Error('Seller account is not fully set up')
      }

      // Create Checkout Session with transfer to seller
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: listing.title,
                description: `Equipment purchase from ${seller.full_name || seller.email}`,
              },
              unit_amount: Math.round(listing.price * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        // Direct transfer to seller (no platform fee for now)
        payment_intent_data: {
          transfer_data: {
            destination: seller.stripe_account_id,
          },
          // TODO: Uncomment to add platform fee later
          // application_fee_amount: Math.round(listing.price * 100 * 0.029), // 2.9% platform fee
          metadata: {
            listing_id: checkoutData.listingId,
            buyer_id: checkoutData.buyerId,
            seller_id: listing.seller_id,
          },
        },
        success_url: checkoutData.successUrl,
        cancel_url: checkoutData.cancelUrl,
        metadata: {
          listing_id: checkoutData.listingId,
          buyer_id: checkoutData.buyerId,
          seller_id: listing.seller_id,
        },
      })

      // Store payment record in database
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          listing_id: checkoutData.listingId,
          buyer_id: checkoutData.buyerId,
          seller_id: listing.seller_id,
          amount: listing.price,
          payment_method: 'stripe',
          payment_intent_id: session.payment_intent as string,
          status: 'pending',
        })
        .select()

      if (paymentError) {
        console.error('❌ Error storing payment record:', {
          error: paymentError,
          details: {
            message: paymentError.message,
            code: paymentError.code,
            hint: paymentError.hint,
            details: paymentError.details
          },
          attemptedData: {
            listing_id: checkoutData.listingId,
            buyer_id: checkoutData.buyerId,
            seller_id: listing.seller_id,
            amount: listing.price,
            payment_method: 'stripe',
            payment_intent_id: session.payment_intent,
            status: 'pending',
          }
        })
        // Don't throw here as the checkout session was created successfully
      } else {
        console.log('✅ Payment record stored successfully:', paymentData)
      }

      return {
        id: session.id,
        url: session.url!,
        paymentIntentId: session.payment_intent as string,
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Validate webhook signature and return the event
   * @param payload - Raw webhook payload
   * @param signature - Stripe signature header
   * @returns Stripe event object
   */
  static async validateWebhook(payload: string, signature: string): Promise<Stripe.Event> {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
      return event
    } catch (error) {
      console.error('Error validating webhook:', error)
      throw new Error('Invalid webhook signature')
    }
  }

  /**
   * Check if a Connect account is fully onboarded
   * @param accountId - Stripe account ID
   * @returns Promise<boolean>
   */
  static async isAccountOnboarded(accountId: string): Promise<boolean> {
    try {
      const account = await stripe.accounts.retrieve(accountId)
      return account.details_submitted && !account.requirements?.disabled_reason
    } catch (error) {
      console.error('Error checking account status:', error)
      return false
    }
  }

  /**
   * Get account status and requirements
   * @param accountId - Stripe account ID
   * @returns Account status information
   */
  static async getAccountStatus(accountId: string) {
    try {
      const account = await stripe.accounts.retrieve(accountId)
      return {
        isOnboarded: account.details_submitted && !account.requirements?.disabled_reason,
        requirements: account.requirements,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      }
    } catch (error) {
      console.error('Error fetching account status:', error)
      throw new Error('Failed to fetch account status')
    }
  }
}

// Helper function to calculate platform fee (for future use)
export function calculatePlatformFee(amount: number, feePercentage: number = 2.9): number {
  return Math.round(amount * 100 * (feePercentage / 100))
}