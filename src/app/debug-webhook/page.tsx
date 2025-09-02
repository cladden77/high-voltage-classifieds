'use client'

import React, { useState } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export default function WebhookDebugPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const testWebhookProcessing = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const user = await getCurrentUser()
      if (!user) {
        setError('Please sign in first')
        return
      }

      // Get a sample listing and order for testing
      const supabase = createClientSupabase()
      
      // Get a listing that's not sold
      const { data: listings } = await supabase
        .from('listings')
        .select('id, title, seller_id')
        .eq('is_sold', false)
        .limit(1)

      if (!listings || listings.length === 0) {
        setError('No unsold listings found for testing')
        return
      }

      const listing = listings[0]

      // Create a test order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.seller_id,
          amount_paid: 1000, // $10.00
          payment_method: 'stripe',
          payment_intent_id: `test_pi_${Date.now()}`,
          status: 'pending'
        })
        .select()
        .single()

      if (orderError) {
        setError(`Error creating test order: ${orderError.message}`)
        return
      }

      // Test the webhook processing
      const response = await fetch('/api/test-webhook-processing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listing.id,
          buyerId: user.id,
          sellerId: listing.seller_id,
          paymentIntentId: order.payment_intent_id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(`Webhook processing failed: ${data.error}`)
        return
      }

      setResult({
        message: 'Webhook processing successful!',
        listing: listing,
        order: order,
        result: data
      })

    } catch (err: any) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Webhook Debug Tool</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h2 className="font-bold text-yellow-800 mb-2">⚠️ Debug Tool</h2>
        <p className="text-yellow-700">
          This tool will create a test order and simulate webhook processing to verify that the database updates work correctly.
        </p>
      </div>

      <button
        onClick={testWebhookProcessing}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-bold"
      >
        {loading ? 'Testing...' : 'Test Webhook Processing'}
      </button>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <p className="font-bold">Success:</p>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h2 className="font-bold text-gray-800 mb-2">Next Steps:</h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-1">
          <li>Run the test above to verify database updates work</li>
          <li>Check your Stripe webhook endpoint URL: <code className="bg-gray-200 px-1 rounded">https://your-domain.com/api/webhooks/stripe</code></li>
          <li>Verify the webhook is enabled in Stripe Dashboard</li>
          <li>Check server logs for webhook events</li>
          <li>Test a real purchase to see if webhook is triggered</li>
        </ol>
      </div>
    </div>
  )
}
