import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  console.log('🧪 Test log message - if you see this, logging is working!')
  console.log('🔔 Webhook test log:', {
    timestamp: new Date().toISOString(),
    message: 'This is a test webhook log message'
  })
  
  return NextResponse.json({ 
    message: 'Test endpoint called',
    timestamp: new Date().toISOString(),
    instructions: 'Check your server logs for the test messages above'
  })
}
