'use client'

import React, { useState, useEffect } from 'react'
import { User, Building, CreditCard, Save, AlertTriangle, CheckCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getCurrentUser } from '@/lib/auth'
import { createClientSupabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    website: '',
    company_name: '',
    can_sell: false
  })

  const router = useRouter()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/signin')
        return
      }

      setUser(currentUser)

      const supabase = createClientSupabase()
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        return
      }

      setUserProfile(profile)
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        website: profile.website || '',
        company_name: profile.company_name || '',
        can_sell: profile.can_sell || false
      })
    } catch (error) {
      console.error('Error loading user data:', error)
      router.push('/auth/signin')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClientSupabase()
      
      // If enabling seller capabilities, we need to reset verification status
      const updateData: any = {
        ...formData,
        updated_at: new Date().toISOString()
      }

      if (formData.can_sell && !userProfile.can_sell) {
        // User is enabling seller capabilities for the first time
        updateData.seller_verified = false
        updateData.seller_verification_date = null
        updateData.stripe_account_id = null
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)

      if (error) {
        throw error
      }

      setMessage({
        type: 'success',
        text: formData.can_sell && !userProfile.can_sell
          ? 'Account updated successfully! Seller capabilities enabled. Complete Stripe Connect onboarding to start selling.'
          : 'Account updated successfully!'
      })

      // Reload user data to reflect changes
      await loadUserData()

    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({
        type: 'error',
        text: 'Failed to update account. Please try again.'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-16 bg-gray-200 rounded-lg w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-staatliches text-[54px] leading-[48px] tracking-[-1.2px] text-gray-900 mb-2">
            Account Settings
          </h1>
          <p className="font-open-sans text-lg text-gray-500">
            Manage your account information and preferences
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-8 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              <p className="font-open-sans text-sm">{message.text}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="font-open-sans text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-open-sans font-bold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block font-open-sans font-bold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block font-open-sans font-bold text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your location"
                />
              </div>

              <div>
                <label className="block font-open-sans font-bold text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-open-sans font-bold text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Tell us about yourself or your business"
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="font-open-sans text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block font-open-sans font-bold text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your company name"
                />
              </div>

              {/* Seller Capabilities */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="can_sell"
                    checked={formData.can_sell}
                    onChange={(e) => handleInputChange('can_sell', e.target.checked)}
                    className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <div>
                    <label htmlFor="can_sell" className="font-open-sans font-bold text-blue-900">
                      Enable Seller Capabilities
                    </label>
                    <p className="font-open-sans text-sm text-blue-700 mt-1">
                      {formData.can_sell 
                        ? 'Seller capabilities are enabled. You can create listings and receive payments after completing Stripe Connect onboarding.'
                        : 'Check this box to enable seller capabilities. You\'ll need to complete Stripe Connect onboarding to start receiving payments.'
                      }
                    </p>
                    {userProfile?.seller_verified && (
                      <div className="mt-2 flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-open-sans text-sm font-medium">Stripe account verified - ready to sell!</span>
                      </div>
                    )}
                    {formData.can_sell && !userProfile?.seller_verified && (
                      <div className="mt-2 flex items-center gap-2 text-yellow-700">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-open-sans text-sm font-medium">Complete Stripe Connect onboarding to start selling</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {formData.can_sell && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="font-open-sans text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Setup
              </h2>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="font-open-sans text-sm text-gray-600 mb-4">
                  {userProfile?.seller_verified 
                    ? 'Your Stripe account is verified and ready to receive payments.'
                    : 'Complete Stripe Connect onboarding to start receiving payments from buyers.'
                  }
                </p>
                
                {!userProfile?.seller_verified && (
                  <a
                    href="/dashboard"
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-open-sans font-bold"
                  >
                    <CreditCard className="h-4 w-4" />
                    Complete Stripe Setup
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-open-sans font-bold flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  )
} 