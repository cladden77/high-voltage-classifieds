'use client'

import React, { useState } from 'react'

export default function WebhookTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const testWebhookEndpoint = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/webhooks/stripe', {
        method: 'GET'
      })

      const data = await response.json()

      if (!response.ok) {
        setError(`Webhook endpoint error: ${response.status} ${response.statusText}`)
        return
      }

      setResult({
        message: 'Webhook endpoint is accessible!',
        data: data
      })

    } catch (err: any) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Webhook Test Page</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="font-bold text-blue-800 mb-2">🔧 Webhook Configuration Check</h2>
        <p className="text-blue-700">
          Your Stripe webhook events are correctly configured. Let's test if the endpoint is accessible.
        </p>
      </div>

      <button
        onClick={testWebhookEndpoint}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-bold"
      >
        {loading ? 'Testing...' : 'Test Webhook Endpoint'}
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
          <li>Test the webhook endpoint above</li>
          <li>Check Stripe Dashboard → Webhooks → Logs for delivery attempts</li>
          <li>Make a test purchase and watch server logs</li>
          <li>Use Stripe's "Send test webhook" feature</li>
          <li>Verify STRIPE_WEBHOOK_SECRET environment variable</li>
        </ol>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h2 className="font-bold text-yellow-800 mb-2">🔍 Debugging Checklist:</h2>
        <ul className="list-disc list-inside text-yellow-700 space-y-1">
          <li>✅ Webhook events configured correctly</li>
          <li>❓ Webhook endpoint accessible</li>
          <li>❓ Webhook secret matches environment variable</li>
          <li>❓ Server receiving webhook requests</li>
          <li>❓ Webhook processing without errors</li>
        </ul>
      </div>
    </div>
  )
}
