import * as React from 'react'
import { Html, Head, Preview, Body, Container, Img, Heading, Text, Button, Hr } from '@react-email/components'

export default function WelcomeEmail({ firstName = 'there' }: { firstName?: string }) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to High Voltage Classifieds</Preview>
      <Body style={{ backgroundColor: '#f8f9fa', fontFamily: 'sans-serif' }}>
        <Container style={{ backgroundColor: '#fff', margin: '40px auto', padding: '32px', maxWidth: '560px', borderRadius: 12 }}>
          <Img src="https://high-voltage-classifieds.vercel.app/logo.png" alt="High Voltage Classifieds" width="160" style={{ margin: '0 auto 16px' }} />
          <Heading as="h2" style={{ textAlign: 'center' }}>Welcome, {firstName} ⚡</Heading>
          <Text style={{ color: '#333', fontSize: 16 }}>Your account is ready. Start browsing listings, sending messages, and managing sales securely.</Text>
          <Button href={`${process.env.APP_URL}/dashboard`} style={{ backgroundColor: '#ffcc00', color: '#000', padding: '12px 18px', borderRadius: 8, textDecoration: 'none', display: 'inline-block', marginTop: 12 }}>Go to your dashboard</Button>
          <Hr style={{ margin: '28px 0' }} />
          <Text style={{ color: '#888', fontSize: 12, textAlign: 'center' }}>© {new Date().getFullYear()} High Voltage Classifieds</Text>
        </Container>
      </Body>
    </Html>
  )
}



