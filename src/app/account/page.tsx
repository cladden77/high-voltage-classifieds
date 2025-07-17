'use client'

import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Save, Camera } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClientSupabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type UserProfile = Database['public']['Tables']['users']['Row']

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    role: 'buyer' as 'buyer' | 'seller'
  })

  const supabase = createClientSupabase()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      // TODO: Get current user ID when auth is implemented
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', 'current-user-id') // TODO: Replace with actual user ID
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        setProfile(data)
        setFormData({
          name: data.name || '',
          email: data.email,
          phone: data.phone || '',
          location: data.location || '',
          role: data.role
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: 'current-user-id', // TODO: Replace with actual user ID
          ...formData,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      
      setProfile(prev => prev ? { ...prev, ...formData } : null)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="bg-gray-200 h-96 rounded-lg"></div>
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
        <div className="mb-8">
          <h1 className="font-staatliches text-[54px] leading-[48px] tracking-[-1.2px] text-gray-900 mb-2">
            Account Settings
          </h1>
          <p className="font-open-sans text-lg text-gray-500">
            Manage your profile and preferences
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gray-50 px-6 py-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="font-open-sans font-bold text-2xl text-gray-600">
                    {formData.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <h2 className="font-open-sans text-2xl font-bold text-gray-900">
                  {formData.name || 'Your Name'}
                </h2>
                <p className="font-open-sans text-gray-600">{formData.email}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-2 ${
                  formData.role === 'seller' 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {formData.role === 'seller' ? 'Seller' : 'Buyer'}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block font-open-sans font-bold text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-open-sans font-bold text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter your email"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block font-open-sans font-bold text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block font-open-sans font-bold text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter your location"
                />
              </div>

              {/* Role */}
              <div className="md:col-span-2">
                <label className="block font-open-sans font-bold text-gray-700 mb-2">
                  Account Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="buyer"
                      checked={formData.role === 'buyer'}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="mr-2"
                    />
                    <span className="font-open-sans">Buyer</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="seller"
                      checked={formData.role === 'seller'}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="mr-2"
                    />
                    <span className="font-open-sans">Seller (Business)</span>
                  </label>
                </div>
                <p className="font-open-sans text-sm text-gray-500 mt-1">
                  Sellers can create listings and manage their inventory
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg font-open-sans font-bold flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="font-open-sans font-bold text-lg text-red-900 mb-2">Danger Zone</h3>
          <p className="font-open-sans text-red-700 mb-4">
            These actions cannot be undone. Please be careful.
          </p>
          <div className="flex gap-4">
            <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-open-sans font-bold">
              Delete Account
            </button>
            <button className="border border-red-600 text-red-600 hover:bg-red-50 py-2 px-4 rounded-lg font-open-sans font-bold">
              Export Data
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
} 