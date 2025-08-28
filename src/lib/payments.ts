import Stripe from 'stripe'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  client_secret?: string
}

export interface PaymentData {
  listingId: string
  buyerId: string
  sellerId: string
  amount: number
  paymentMethod: 'stripe'
}

// Stripe Integration
export class StripePayments {
  static async createPaymentIntent(data: PaymentData): Promise<PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          listing_id: data.listingId,
          buyer_id: data.buyerId,
          seller_id: data.sellerId,
        },
      })

      return {
        id: paymentIntent.id,
        amount: data.amount,
        currency: 'usd',
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret || undefined,
      }
    } catch (error) {
      console.error('Error creating Stripe payment intent:', error)
      throw new Error('Failed to create payment intent')
    }
  }

  static async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      
      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      }
    } catch (error) {
      console.error('Error confirming Stripe payment:', error)
      throw new Error('Failed to confirm payment')
    }
  }

  static async handleWebhook(payload: string, signature: string): Promise<any> {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )

      return event
    } catch (error) {
      console.error('Error handling Stripe webhook:', error)
      throw new Error('Invalid webhook signature')
    }
  }
}




// General payment utilities - formatPrice moved to @/lib/format

export function validatePaymentData(data: Partial<PaymentData>): data is PaymentData {
  return !!(
    data.listingId &&
    data.buyerId &&
    data.sellerId &&
    data.amount &&
    data.amount > 0 &&
    data.paymentMethod &&
    data.paymentMethod === 'stripe'
  )
} 