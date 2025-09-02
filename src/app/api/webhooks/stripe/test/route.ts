import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Webhook test endpoint is accessible',
    endpoint: '/api/webhooks/stripe',
    instructions: [
      '1. Go to Stripe Dashboard → Developers → Webhooks',
      '2. Add endpoint: https://your-domain.com/api/webhooks/stripe',
      '3. Select these events:',
      '   - checkout.session.completed',
      '   - payment_intent.succeeded', 
      '   - account.updated',
      '4. Copy the webhook signing secret to your environment variables',
      '5. Test the webhook using Stripe\'s test feature',
      '6. Check server logs for webhook events',
      '',
      'IMPORTANT: For Connect transfers, you need payment_intent.succeeded events!'
    ],
    currentUrl: request.url,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  })
}
