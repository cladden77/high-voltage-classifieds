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
  paymentMethod: 'stripe' | 'paypal'
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

// PayPal Integration (using PayPal REST API)
export class PayPalPayments {
  private static async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64')

    const response = await fetch(`${process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com'}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    })

    const data = await response.json()
    return data.access_token
  }

  static async createOrder(data: PaymentData): Promise<{ id: string; approval_url?: string }> {
    try {
      const accessToken = await this.getAccessToken()

      const order = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: data.amount.toFixed(2),
            },
            description: `Equipment purchase - Listing ${data.listingId}`,
            custom_id: data.listingId,
          },
        ],
        application_context: {
          return_url: `${process.env.NEXTAUTH_URL}/payment/success`,
          cancel_url: `${process.env.NEXTAUTH_URL}/payment/cancel`,
        },
      }

      const response = await fetch(`${process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com'}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(order),
      })

      const result = await response.json()
      
      const approvalUrl = result.links?.find((link: any) => link.rel === 'approve')?.href

      return {
        id: result.id,
        approval_url: approvalUrl,
      }
    } catch (error) {
      console.error('Error creating PayPal order:', error)
      throw new Error('Failed to create PayPal order')
    }
  }

  static async captureOrder(orderId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(`${process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com'}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      })

      return await response.json()
    } catch (error) {
      console.error('Error capturing PayPal order:', error)
      throw new Error('Failed to capture PayPal order')
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
    ['stripe', 'paypal'].includes(data.paymentMethod)
  )
} 