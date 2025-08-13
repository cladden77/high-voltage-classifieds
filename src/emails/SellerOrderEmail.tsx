import * as React from 'react'
import { Html, Head, Preview, Body, Container, Img, Heading, Text, Button, Hr } from '@react-email/components'

export default function SellerOrderEmail({ sellerName = 'Seller', listingTitle = 'Listing', amount = '$0.00', link = '#' }: { sellerName?: string; listingTitle?: string; amount?: string; link?: string }) {
  return (
    <Html>
      <Head />
      <Preview>Your item has been purchased</Preview>
      <Body style={{ backgroundColor: '#f8f9fa', fontFamily: 'sans-serif' }}>
        <Container style={{ backgroundColor: '#fff', margin: '40px auto', padding: '32px', maxWidth: '560px', borderRadius: 12 }}>
          <Img src="https://high-voltage-classifieds.vercel.app/logo.png" alt="High Voltage Classifieds" width="160" style={{ margin: '0 auto 16px' }} />
          <Heading as="h2" style={{ textAlign: 'center' }}>You made a sale 🎉</Heading>
          <Text style={{ color: '#333', fontSize: 16 }}>Hi {sellerName}, your listing <strong>{listingTitle}</strong> has been purchased.</Text>
          <Text style={{ fontSize: 16 }}>Total: <strong>{amount}</strong></Text>
          <Button href={link} style={{ backgroundColor: '#ffcc00', color: '#000', padding: '12px 18px', borderRadius: 8, textDecoration: 'none', display: 'inline-block', marginTop: 12 }}>View order details</Button>
          <Hr style={{ margin: '28px 0' }} />
          <Text style={{ color: '#888', fontSize: 12, textAlign: 'center' }}>© {new Date().getFullYear()} High Voltage Classifieds</Text>
        </Container>
      </Body>
    </Html>
  )
}



