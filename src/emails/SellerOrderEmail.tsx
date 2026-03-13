import * as React from 'react'
import { Html, Head, Preview, Body, Container, Img, Heading, Text, Button, Hr } from '@react-email/components'

type SellerOrderEmailProps = {
  sellerName?: string
  listingTitle?: string
  amount?: string
  link?: string
  buyerName?: string
  buyerEmail?: string
  buyerPhone?: string
}

export default function SellerOrderEmail({
  sellerName = 'Seller',
  listingTitle = 'Listing',
  amount = '$0.00',
  link = '#',
  buyerName,
  buyerEmail,
  buyerPhone,
}: SellerOrderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your item has been purchased</Preview>
      <Body style={{ backgroundColor: '#f8f9fa', fontFamily: 'sans-serif' }}>
        <Container style={{ backgroundColor: '#fff', margin: '40px auto', padding: '32px', maxWidth: '560px', borderRadius: 12 }}>
          <Img src="https://highvoltageclassifieds.com/assets/high-voltage-classifieds-logo.svg" alt="High Voltage Classifieds" width="160" style={{ margin: '0 auto 16px' }} />
          <Heading as="h2" style={{ textAlign: 'center' }}>You made a sale 🎉</Heading>
          <Text style={{ color: '#333', fontSize: 16 }}>Hi {sellerName}, your listing <strong>{listingTitle}</strong> has been purchased.</Text>
          <Text style={{ fontSize: 16 }}>Total: <strong>{amount}</strong></Text>

          {(buyerName || buyerEmail || buyerPhone) && (
            <>
              <Hr style={{ margin: '24px 0' }} />
              <Heading as="h3" style={{ fontSize: 18, marginBottom: 8 }}>Buyer details</Heading>
              {buyerName && (
                <Text style={{ fontSize: 14, margin: '2px 0' }}>
                  <strong>Name:</strong> {buyerName}
                </Text>
              )}
              {buyerEmail && (
                <Text style={{ fontSize: 14, margin: '2px 0' }}>
                  <strong>Email:</strong> {buyerEmail}
                </Text>
              )}
              {buyerPhone && (
                <Text style={{ fontSize: 14, margin: '2px 0' }}>
                  <strong>Phone:</strong> {buyerPhone}
                </Text>
              )}
            </>
          )}

          <Button href={link} style={{ backgroundColor: '#ffcc00', color: '#000', padding: '12px 18px', borderRadius: 8, textDecoration: 'none', display: 'inline-block', marginTop: 16 }}>View order details</Button>
          <Hr style={{ margin: '28px 0' }} />
          <Text style={{ color: '#888', fontSize: 12, textAlign: 'center' }}>© {new Date().getFullYear()} High Voltage Classifieds</Text>
        </Container>
      </Body>
    </Html>
  )
}



