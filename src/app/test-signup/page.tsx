'use client'

import React, { useState } from 'react'
import { signUpWithCredentials, getCurrentUser } from '@/lib/auth'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TestSignupPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testSignup = async () => {
    setIsLoading(true)
    setTestResults([])
    
    try {
      addResult('Starting signup test...')
      
      // Test with seller role
      const testEmail = `test-seller-${Date.now()}@example.com`
      const testPassword = 'testpassword123'
      const testName = 'Test Seller'
      const testRole = 'seller'
      
      addResult(`Testing signup with role: ${testRole}`)
      addResult(`Email: ${testEmail}`)
      
      const result = await signUpWithCredentials(
        testEmail,
        testPassword,
        testName,
        testRole
      )
      
      if (result.success && result.user) {
        addResult('✅ Signup successful')
        addResult(`User ID: ${result.user.id}`)
        addResult(`Role: ${result.user.role}`)
        
        // Test getting the user back
        addResult('Testing getCurrentUser...')
        const currentUser = await getCurrentUser()
        
        if (currentUser) {
          addResult(`✅ getCurrentUser successful`)
          addResult(`Retrieved role: ${currentUser.role}`)
          addResult(`User name: ${currentUser.name}`)
        } else {
          addResult('❌ getCurrentUser failed')
        }
      } else {
        addResult(`❌ Signup failed: ${result.error}`)
      }
    } catch (error) {
      addResult(`💥 Exception: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-8 py-8">
        <h1 className="font-staatliches text-4xl text-gray-900 mb-8">Signup Test Page</h1>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="font-open-sans text-xl font-bold mb-4">Test Controls</h2>
            <div className="space-y-4">
              <button
                onClick={testSignup}
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-open-sans font-bold"
              >
                {isLoading ? 'Testing...' : 'Test Seller Signup'}
              </button>
              
              <button
                onClick={clearResults}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-open-sans font-bold ml-4"
              >
                Clear Results
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="font-open-sans text-xl font-bold mb-4">Test Results</h2>
            <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">No test results yet. Click "Test Seller Signup" to start.</p>
              ) : (
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="font-mono text-sm">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
} 