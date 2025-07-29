'use client'

import React, { useState, useEffect } from 'react'
import { createUserProfile, getCurrentUser, debugAuthState } from '@/lib/auth'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function DebugPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser()
      setCurrentUser(user)
      
      const debug = await debugAuthState()
      setDebugInfo(debug)
    } catch (error) {
      console.error('Debug auth error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fixUserProfile = async () => {
    if (!currentUser) {
      setMessage('No user found')
      return
    }

    try {
      setMessage('Fixing user profile...')
      const result = await createUserProfile(
        currentUser.id,
        currentUser.email,
        currentUser.name || 'Unknown User',
        currentUser.role || 'buyer'
      )

      if (result.success) {
        setMessage('Profile fixed successfully! Refreshing...')
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage(`Failed to fix profile: ${result.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="animate-pulse">Loading...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-8 py-8">
        <h1 className="font-staatliches text-4xl text-gray-900 mb-8">Debug Page</h1>
        
        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700">{message}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Current User Info */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="font-open-sans text-xl font-bold mb-4">Current User</h2>
            <pre className="bg-white p-4 rounded border overflow-auto text-sm">
              {JSON.stringify(currentUser, null, 2)}
            </pre>
          </div>

          {/* Debug Info */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="font-open-sans text-xl font-bold mb-4">Debug Info</h2>
            <pre className="bg-white p-4 rounded border overflow-auto text-sm">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="font-open-sans text-xl font-bold mb-4">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={fixUserProfile}
                disabled={!currentUser}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-open-sans font-bold"
              >
                Fix User Profile
              </button>
              
              <button
                onClick={checkAuth}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-open-sans font-bold ml-4"
              >
                Refresh Debug Info
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
} 