import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const test = searchParams.get('test')

  return NextResponse.json({
    message: 'Webhook configuration test',
    environment: {
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      webhookSecretLength: process.env.STRIPE_WEBHOOK_SECRET?.length || 0,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      stripeKeyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    },
    currentUrl: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    instructions: [
      '1. Check if STRIPE_WEBHOOK_SECRET is set and matches Stripe Dashboard',
      '2. Check if STRIPE_SECRET_KEY is set',
      '3. Verify webhook URL in Stripe Dashboard matches your domain',
      '4. Test webhook using Stripe Dashboard test feature',
      '5. Check Vercel logs for webhook events'
    ],
    test: test || 'no test specified'
  })
}
