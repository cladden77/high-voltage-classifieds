'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Heart, MessageCircle, ArrowLeft, Star, AlertCircle, CheckCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AuthModal from '@/components/AuthModal'
import { createClientSupabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { Database } from '@/lib/database.types'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  users: Database['public']['Tables']['users']['Row'] | null
}

export default function ListingDetailPage() {
  const params = useParams()
  const listingId = params.id as string
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [isFavorited, setIsFavorited] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageError, setMessageError] = useState<string | null>(null)
  const [messageSuccess, setMessageSuccess] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalAction, setAuthModalAction] = useState('')

  const supabase = createClientSupabase()

  // Helper function to show auth modal
  const showAuthPrompt = (action: string) => {
    setAuthModalAction(action)
    setShowAuthModal(true)
  }

  useEffect(() => {
    checkAuth()
    fetchListing()
  }, [listingId])

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser()
      setCurrentUser(user)
    } catch (error) {
      console.error('Error checking auth:', error)
    }
  }

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          users (*)
        `)
        .eq('id', listingId)
        .single()

      if (error) throw error
      setListing(data)
    } catch (error) {
      console.error('Error fetching listing:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async () => {
    if (!currentUser) {
      showAuthPrompt('save favorites')
      return
    }
    
    try {
      if (isFavorited) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('listing_id', listingId)
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert({
            user_id: currentUser.id,
            listing_id: listingId
          })
      }
      setIsFavorited(!isFavorited)
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('Failed to update favorites')
    }
  }

  const handleSendMessage = async () => {
    if (!currentUser) {
      setMessageError('Please sign in to send messages')
      return
    }

    if (!messageText.trim()) {
      setMessageError('Please enter a message')
      return
    }

    if (currentUser.id === listing?.seller_id) {
      setMessageError('You cannot message yourself')
      return
    }

    if (!listing) {
      setMessageError('Listing information not available')
      return
    }

    try {
      setSendingMessage(true)
      setMessageError(null)

      // Debug: Check auth state
      const { data: { user: authUser } } = await supabase.auth.getUser()
      console.log('🔍 Auth Debug Info:')
      console.log('Current User ID (from our system):', currentUser.id)
      console.log('Auth User ID (from Supabase):', authUser?.id)
      console.log('Auth User Object:', authUser)
      console.log('Current User Object:', currentUser)

      if (!authUser) {
        setMessageError('Authentication session expired. Please sign in again.')
        return
      }

      if (authUser.id !== currentUser.id) {
        console.error('❌ ID MISMATCH! Auth ID !== Current User ID')
        setMessageError('Authentication mismatch. Please sign out and sign in again.')
        return
      }

      console.log('🔄 Sending message from listing page:', {
        sender_id: currentUser.id,
        recipient_id: listing.seller_id,
        listing_id: listingId,
        message_text: messageText.trim()
      })

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          recipient_id: listing.seller_id,
          listing_id: listingId,
          message_text: messageText.trim(),
          read: false
        })
        .select()

      if (error) {
        console.error('❌ Message send error:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        // Provide more specific error messages
        if (error.message.includes('row-level security')) {
          setMessageError('Permission denied. Please sign out and sign in again to refresh your session.')
        } else if (error.message.includes('foreign key')) {
          setMessageError('Invalid user or listing reference. Please refresh the page.')
        } else {
          setMessageError(`Database error: ${error.message}`)
        }
        return
      }

      console.log('✅ Message sent successfully:', data)
      
      setMessageSuccess(true)
      setMessageText('')
      
      // Close modal after 2 seconds and redirect to messages
      setTimeout(() => {
        setShowMessageModal(false)
        setMessageSuccess(false)
        window.location.href = '/messages'
      }, 2000)

    } catch (error) {
      console.error('💥 Unexpected error sending message:', error)
      setMessageError('Failed to send message. Please try again.')
    } finally {
      setSendingMessage(false)
    }
  }

  const openMessageModal = () => {
    if (!currentUser) {
      showAuthPrompt('send messages')
      return
    }

    if (currentUser.id === listing?.seller_id) {
      alert('You cannot message yourself')
      return
    }

    setShowMessageModal(true)
    setMessageError(null)
    setMessageSuccess(false)
  }

  const handlePayment = (method: 'stripe' | 'paypal') => {
    if (!currentUser) {
      showAuthPrompt('make purchases')
      return
    }

    // TODO: Implement payment processing
    console.log(`Processing payment with ${method}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
            <p className="text-gray-600">The listing you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Back Button */}
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-open-sans">Back to Listings</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square bg-gray-200 rounded-lg mb-4 overflow-hidden">
              {listing.images && listing.images.length > 0 ? (
                <img 
                  src={listing.images[currentImageIndex]} 
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-500 font-open-sans">No Image Available</span>
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                      currentImageIndex === index ? 'border-orange-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt={`${listing.title} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Listing Details */}
          <div>
            {/* Status and Favorite */}
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                listing.condition === 'new' ? 'bg-green-100 text-green-800' :
                listing.condition === 'used' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {listing.condition}
              </span>
              <button 
                onClick={toggleFavorite}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Heart className={`h-6 w-6 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
            </div>

            {/* Title and Price */}
            <h1 className="font-staatliches text-4xl text-gray-900 mb-2">{listing.title}</h1>
            <p className="font-open-sans text-3xl font-bold text-gray-900 mb-4">
              ${listing.price.toLocaleString()}
            </p>

            {/* Location and Category */}
            <div className="flex gap-6 mb-6">
              <div>
                <span className="text-sm text-gray-500 font-open-sans">Location</span>
                <p className="font-open-sans font-bold">{listing.location}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 font-open-sans">Category</span>
                <p className="font-open-sans font-bold">{listing.category}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="font-open-sans font-bold text-lg mb-3">Description</h3>
              <p className="font-open-sans text-gray-700 leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Seller Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-open-sans font-bold text-lg mb-3">Seller Information</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="font-open-sans font-bold text-gray-600">
                    {listing.users?.full_name?.charAt(0) || 'S'}
                  </span>
                </div>
                <div>
                  <p className="font-open-sans font-bold">{listing.users?.full_name || 'Seller'}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-open-sans text-sm text-gray-600">4.8 (127 reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button 
                onClick={openMessageModal}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-open-sans font-bold flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                Message Seller
              </button>
              
              {!listing.is_sold && (
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handlePayment('stripe')}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-open-sans font-bold"
                  >
                    Pay with Stripe
                  </button>
                  <button 
                    onClick={() => handlePayment('paypal')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-lg font-open-sans font-bold"
                  >
                    Pay with PayPal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="font-open-sans font-bold text-lg mb-4">
              Message {listing.users?.full_name || 'Seller'}
            </h3>
            
            {/* Error Message */}
            {messageError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="font-open-sans text-sm text-red-700">{messageError}</p>
              </div>
            )}

            {/* Success Message */}
            {messageSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <p className="font-open-sans text-sm text-green-700">
                  Message sent successfully! Redirecting to your messages...
                </p>
              </div>
            )}

            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Hi! I'm interested in your ${listing.title}. Is it still available?`}
              disabled={sendingMessage || messageSuccess}
              className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowMessageModal(false)}
                disabled={sendingMessage}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-open-sans font-bold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || messageSuccess || !messageText.trim()}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-open-sans font-bold flex items-center justify-center gap-2"
              >
                {sendingMessage ? (
                  <>
                    <div className="animate-spin h-4 w-4 border border-white border-t-transparent rounded-full"></div>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        action={authModalAction}
      />

      <Footer />
    </div>
  )
}