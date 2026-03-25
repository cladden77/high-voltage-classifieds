import { NextRequest, NextResponse } from 'next/server'
import { processStripeWebhookEvent } from '@/lib/stripe-webhook-handler'
import { validateWebhookFromSecrets } from '@/lib/stripe-webhook-verify'

export async function GET() {
  return NextResponse.json({
    message: 'Stripe connect webhook endpoint is accessible',
    endpoint: '/api/webhooks/stripe/connect',
    eventsFrom: 'Connected and v2 accounts',
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
      process.env.STRIPE_WEBHOOK_SECRET_CONNECT,
      process.env.STRIPE_WEBHOOK_SECRET,
    ])

    console.log('✅ Connect webhook validated:', {
      eventType: event.type,
      eventId: event.id,
      route: '/api/webhooks/stripe/connect',
    })

    await processStripeWebhookEvent(event)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Error processing connect webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 200 })
  }
}
