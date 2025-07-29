'use client'

import React, { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, User, Building } from 'lucide-react'
import { signUpWithCredentials } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer' as 'buyer' | 'seller'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    console.log('🔍 Form field changed:', field, 'to:', value)
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    try {
      console.log('🔍 Submitting form with role:', formData.role)
      console.log('🔍 Full form data:', formData)
      
      const result = await signUpWithCredentials(
        formData.email,
        formData.password,
        formData.name,
        formData.role
      )
      
      if (result.success) {
        // Store user session
        localStorage.setItem('user', JSON.stringify(result.user))
        router.push('/dashboard')
      } else {
        setError(result.error || 'Failed to create account')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    // TODO: Implement Google OAuth flow
    console.log('Google sign up clicked')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="font-staatliches text-4xl text-gray-900 mb-2">
            Create Account
          </h2>
          <p className="font-open-sans text-gray-600">
            Join High Voltage Classifieds marketplace
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-lg border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-open-sans text-sm">{error}</p>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block font-open-sans font-bold text-gray-700 mb-3">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('role', 'buyer')}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    formData.role === 'buyer'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-open-sans font-bold">Buyer</div>
                  <div className="font-open-sans text-xs text-gray-500">Browse & purchase equipment</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange('role', 'seller')}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    formData.role === 'seller'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Building className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-open-sans font-bold">Seller</div>
                  <div className="font-open-sans text-xs text-gray-500">List & sell equipment</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-open-sans font-bold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label className="block font-open-sans font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block font-open-sans font-bold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-open-sans font-bold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm font-open-sans text-gray-700">
                I agree to the{' '}
                <a href="/terms" className="text-orange-600 hover:text-orange-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-orange-600 hover:text-orange-500">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-open-sans font-bold transition-colors"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
            
            {/* Debug button - remove after testing */}
            <button
              type="button"
              onClick={() => {
                console.log('🔍 Current form data:', formData)
                console.log('🔍 Selected role:', formData.role)
              }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-open-sans font-bold transition-colors mt-2"
            >
              Debug: Check Current Role
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white font-open-sans text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignUp}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white font-open-sans font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Sign up with Google</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="font-open-sans text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/auth/signin" className="font-medium text-orange-600 hover:text-orange-500">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 