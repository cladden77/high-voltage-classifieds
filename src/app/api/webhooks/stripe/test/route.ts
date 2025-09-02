import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  console.log('🧪 Webhook endpoint test - if you see this, the endpoint is accessible!')
  
  return NextResponse.json({ 
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    endpoint: '/api/webhooks/stripe',
    test: 'success'
  })
}
