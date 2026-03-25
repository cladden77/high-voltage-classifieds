import { NextRequest, NextResponse } from 'next/server'
import { processStripeWebhookEvent } from '@/lib/stripe-webhook-handler'
import { validateWebhookFromSecrets } from '@/lib/stripe-webhook-verify'

export async function GET() {
  return NextResponse.json({
    message: 'Stripe platform webhook endpoint is accessible',
    endpoint: '/api/webhooks/stripe/platform',
    eventsFrom: 'Your account',
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
    }

    const { event } = await validateWebhookFromSecrets(body, signature, [
      process.env.STRIPE_WEBHOOK_SECRET_PLATFORM,
      process.env.STRIPE_WEBHOOK_SECRET,
    ])

    console.log('✅ Platform webhook validated:', {
      eventType: event.type,
      eventId: event.id,
      route: '/api/webhooks/stripe/platform',
    })

    await processStripeWebhookEvent(event)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Error processing platform webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 200 })
  }
}
