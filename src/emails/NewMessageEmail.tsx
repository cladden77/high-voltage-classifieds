import * as React from 'react'
import { Html, Head, Preview, Body, Container, Img, Heading, Text, Button, Hr } from '@react-email/components'

export default function NewMessageEmail({ recipientName = 'there', senderName = 'A user', preview = '', link = '#' }: { recipientName?: string; senderName?: string; preview?: string; link?: string }) {
  return (
    <Html>
      <Head />
      <Preview>New message from {senderName}</Preview>
      <Body style={{ backgroundColor: '#f8f9fa', fontFamily: 'sans-serif' }}>
        <Container style={{ backgroundColor: '#fff', margin: '40px auto', padding: '32px', maxWidth: '560px', borderRadius: 12 }}>
          <Img src="https://high-voltage-classifieds.vercel.app/logo.png" alt="High Voltage Classifieds" width="160" style={{ margin: '0 auto 16px' }} />
          <Heading as="h2" style={{ textAlign: 'center' }}>You’ve got a new message</Heading>
          <Text style={{ color: '#333', fontSize: 16 }}>Hi {recipientName}, {senderName} sent you a new message:</Text>
          <Text style={{ background: '#f3f4f6', padding: 12, borderRadius: 8, fontStyle: 'italic' }}>{preview || 'New message…'}</Text>
          <Button href={link} style={{ backgroundColor: '#ffcc00', color: '#000', padding: '12px 18px', borderRadius: 8, textDecoration: 'none', display: 'inline-block', marginTop: 12 }}>View conversation</Button>
          <Hr style={{ margin: '28px 0' }} />
          <Text style={{ color: '#888', fontSize: 12, textAlign: 'center' }}>© {new Date().getFullYear()} High Voltage Classifieds</Text>
        </Container>
      </Body>
    </Html>
  )
}



