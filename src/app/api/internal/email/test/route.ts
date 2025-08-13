import { NextRequest, NextResponse } from 'next/server'
import { sendNewMessageEmail, sendSellerOrderEmail, sendWelcomeEmail } from '@/lib/email/send'

export const runtime = "nodejs";

export async function GET(_request: NextRequest) {
  try {
    // Update these if you want to test with a specific inbox
    const to = process.env.RESEND_TEST_TO || 'chris.ladden@gmail.com'

    await sendWelcomeEmail({ to, firstName: 'Chris' })
    await sendNewMessageEmail({ to, recipientName: 'Chris', senderName: 'Alex', preview: 'Hey! Is your transformer still available?', conversationId: 'sample-convo-123' })
    await sendSellerOrderEmail({ to, sellerName: 'Chris', listingTitle: 'Siemens 25kVA Transformer', amount: '$1,250.00', orderId: 'order_123' })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Failed' }, { status: 500 })
  }
}