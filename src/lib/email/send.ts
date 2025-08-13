import { resend, FROM, APP_URL } from './resend'
import WelcomeEmail from '@/emails/WelcomeEmail'
import NewMessageEmail from '@/emails/NewMessageEmail'
import SellerOrderEmail from '@/emails/SellerOrderEmail'

export async function sendWelcomeEmail({ to, firstName }: { to: string; firstName?: string }) {
  await resend.emails.send({ from: FROM, to, subject: 'Welcome to High Voltage', react: WelcomeEmail({ firstName }) })
}

export async function sendNewMessageEmail({
  to,
  recipientName,
  senderName,
  preview,
  conversationId
}: NewMessageEmailParams) {
  try {
    const link = `${APP_URL}/messages?conversation=${conversationId}`
    const result = await resend.emails.send({
      from: FROM,
      to: [to],
      subject: `New message from ${senderName}`,
      react: NewMessageEmail({
        recipientName: recipientName || 'there',
        senderName,
        preview: preview || 'No preview available',
        link
      })
    })
    return result
  } catch (error) {
    console.error('❌ Failed to send new message email:', { error, to, recipientName, senderName })
    throw error
  }
}

export async function sendSellerOrderEmail({ to, sellerName, listingTitle, amount, orderId }: { to: string; sellerName?: string; listingTitle?: string; amount?: string; orderId: string | number }) {
  const link = `${APP_URL}/orders/${orderId}`
  await resend.emails.send({ from: FROM, to, subject: `Your listing was purchased`, react: SellerOrderEmail({ sellerName, listingTitle, amount, link }) })
}


