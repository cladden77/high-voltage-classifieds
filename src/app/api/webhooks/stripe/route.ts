import { NextRequest, NextResponse } from 'next/server'
import { processStripeWebhookEvent } from '@/lib/stripe-webhook-handler'
import { validateWebhookFromSecrets } from '@/lib/stripe-webhook-verify'

export async function GET() {
  return NextResponse.json({
    message: 'Stripe webhook compatibility endpoint is accessible',
    endpoint: '/api/webhooks/stripe',
    recommendedEndpoints: [
      '/api/webhooks/stripe/platform',
      '/api/webhooks/stripe/connect',
    ],
    instructions: [
      'Use /platform for Your account events and /connect for Connected account events.',
      'This endpoint remains for backward compatibility during migration.',
    ],
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    console.log('🔔 Webhook received:', {
      hasBody: !!body,
      bodyLength: body.length,
      hasSignature: !!signature,
      signatureLength: signature?.length,
      headers: Object.fromEntries(request.headers.entries())
    })

    if (!signature) {
      console.error('❌ No signature provided')
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    let event
    try {
      const validation = await validateWebhookFromSecrets(body, signature, [
        process.env.STRIPE_WEBHOOK_SECRET_PLATFORM,
        process.env.STRIPE_WEBHOOK_SECRET_CONNECT,
        process.env.STRIPE_WEBHOOK_SECRET,
      ])
      event = validation.event
      console.log('✅ Webhook validated:', {
        eventType: event.type,
        eventId: event.id,
        created: event.created,
        account: event.account,
        route: '/api/webhooks/stripe',
      })
    } catch (validationError) {
      console.error('❌ Webhook validation failed:', validationError)
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }

    await processStripeWebhookEvent(event)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    // Return 200 to prevent Stripe from retrying failed webhooks
    // This prevents webhook delivery failures
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 200 }
    )
  }
} 