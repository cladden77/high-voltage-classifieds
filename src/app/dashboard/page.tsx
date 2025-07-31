'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Plus, Edit, Trash2, MessageSquare, Eye, DollarSign, Send, Clock, Heart, CheckCircle, X, CreditCard, AlertTriangle, User } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClientSupabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { Database } from '@/lib/database.types'
import { useSearchParams } from 'next/navigation'
import { formatCondition } from '@/lib/utils'
import StripeAccountStatus from '@/components/stripe/StripeAccountStatus'
import ConnectAccountButton from '@/components/stripe/ConnectAccountButton'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

type Listing = Database['public']['Tables']['listings']['Row']
type FavoriteWithListing = {
  id: string
  listing_id: string
  created_at: string
  listings: Database['public']['Tables']['listings']['Row']
}

function DashboardContent() {
  const [listings, setListings] = useState<Listing[]>([])
  const [favorites, setFavorites] = useState<FavoriteWithListing[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'listings' | 'messages' | 'analytics' | 'favorites' | 'payments' | 'account'>('listings')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [stripeAccountStatus, setStripeAccountStatus] = useState<any>(null)

  const searchParams = useSearchParams()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    // Check for success messages in URL params
    const success = searchParams.get('success')
    if (success === 'listing-created') {
      setSuccessMessage('Listing created successfully!')
    } else if (success === 'listing-updated') {
      setSuccessMessage('Listing updated successfully!')
    }
    
    // Clear success message after 5 seconds
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, successMessage])

  useEffect(() => {
    if (currentUser) {
      console.log('🔍 Dashboard: Current user role:', currentUser.role)
      console.log('🔍 Dashboard: Current user object:', currentUser)
      
      // Fetch user profile from database
      fetchUserProfile()
      
      if (currentUser.role === 'seller') {
        console.log('🔍 Dashboard: Loading seller dashboard')
        fetchListings()
        fetchStripeStatus()
      } else {
        console.log('🔍 Dashboard: Loading buyer dashboard')
        fetchFavorites()
        setActiveTab('favorites') // Default to favorites for buyers
      }
    }
  }, [currentUser])

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        window.location.href = '/auth/signin'
        return
      }
      setCurrentUser(user)
    } catch (error) {
      console.error('Error checking auth:', error)
      window.location.href = '/auth/signin'
    }
  }

  const fetchUserProfile = async () => {
    if (!currentUser) return

    try {
      const supabase = createClientSupabase()
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchListings = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      const supabase = createClientSupabase()
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setListings(data || [])
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFavorites = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      const supabase = createClientSupabase()
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          listings (*)
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFavorites(data || [])
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (favoriteId: string) => {
    try {
      const supabase = createClientSupabase()
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId)

      if (error) throw error
      setFavorites(favorites.filter(fav => fav.id !== favoriteId))
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  const deleteListing = async (listingId: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      try {
        const supabase = createClientSupabase()
        const { error } = await supabase
          .from('listings')
          .delete()
          .eq('id', listingId)

        if (error) throw error
        setListings(listings.filter(listing => listing.id !== listingId))
      } catch (error) {
        console.error('Error deleting listing:', error)
      }
    }
  }

  const toggleSoldStatus = async (listingId: string, currentStatus: boolean) => {
    try {
      const supabase = createClientSupabase()
      const { error } = await supabase
        .from('listings')
        .update({ is_sold: !currentStatus })
        .eq('id', listingId)

      if (error) throw error
      
      setListings(listings.map(listing => 
        listing.id === listingId 
          ? { ...listing, is_sold: !currentStatus }
          : listing
      ))
    } catch (error) {
      console.error('Error updating listing status:', error)
    }
  }

  const fetchStripeStatus = async () => {
    try {
      const response = await fetch('/api/create-stripe-account', {
        method: 'GET',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStripeAccountStatus(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching Stripe status:', error)
    }
  }

  const stats = {
    totalListings: listings.length,
    activeListing: listings.filter(l => !l.is_sold).length,
    soldListings: listings.filter(l => l.is_sold).length,
    totalValue: listings.reduce((sum, l) => sum + l.price, 0)
  }

  const buyerStats = {
    totalFavorites: favorites.length,
    recentFavorites: favorites.filter(f => {
      const daysSinceAdded = Math.floor((Date.now() - new Date(f.created_at).getTime()) / (1000 * 60 * 60 * 24))
      return daysSinceAdded <= 7
    }).length
  }

  // Messages Tab Component
  function MessagesTab({ currentUser }: { currentUser: any }) {
    const [conversations, setConversations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      if (currentUser) {
        fetchConversations()
      }
    }, [currentUser])

    const fetchConversations = async () => {
      try {
        setLoading(true)
        const supabase = createClientSupabase()
        
        // Fetch messages where current user is sender or recipient
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:sender_id(id, full_name, email, role),
            recipient:recipient_id(id, full_name, email, role),
            listings:listing_id(id, title, price, category, location)
          `)
          .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Group messages into conversations by listing
        const conversationMap = new Map()
        
        data?.forEach((message) => {
          const conversationKey = `${message.listing_id}`
          const isCurrentUserSender = message.sender_id === currentUser.id
          const otherUser = isCurrentUserSender ? message.recipient : message.sender

          if (!conversationMap.has(conversationKey)) {
            conversationMap.set(conversationKey, {
              id: conversationKey,
              otherUser: otherUser,
              listing: message.listings,
              lastMessage: message,
              unreadCount: !message.is_read && !isCurrentUserSender ? 1 : 0,
              messageCount: 1
            })
          } else {
            const conv = conversationMap.get(conversationKey)
            if (!message.is_read && !isCurrentUserSender) {
              conv.unreadCount++
            }
            conv.messageCount++
          }
        })

        setConversations(Array.from(conversationMap.values()))
      } catch (error) {
        console.error('Error fetching conversations:', error)
      } finally {
        setLoading(false)
      }
    }

    if (loading) {
      return (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      )
    }

    if (conversations.length === 0) {
      return (
        <div className="text-center py-16">
          <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-open-sans text-xl font-bold text-gray-900 mb-2">No Messages Yet</h3>
          <p className="font-open-sans text-gray-500 mb-6">
            {currentUser.role === 'seller' 
              ? "Messages from potential buyers will appear here"
              : "Messages to sellers will appear here"}
          </p>
          <a
            href="/messages"
            className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-open-sans font-bold inline-block"
          >
            Go to Messages
          </a>
        </div>
      )
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-open-sans text-xl font-bold text-gray-900">Recent Messages</h2>
          <a
            href="/messages"
            className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-open-sans font-bold"
          >
            View All Messages
          </a>
        </div>

        <div className="space-y-4">
          {conversations.slice(0, 10).map((conversation) => (
            <div 
              key={conversation.id} 
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-orange-300 transition-all duration-200 cursor-pointer group"
              onClick={() => window.location.href = `/messages?conversation=${conversation.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-open-sans font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
                      {conversation.otherUser.full_name || 'Unknown User'}
                    </h3>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        {conversation.unreadCount} new
                      </span>
                    )}
                  </div>
                  <p className="font-open-sans text-sm text-gray-600 mb-2">
                    Re: {conversation.listing.title}
                  </p>
                  <p className="font-open-sans text-sm text-gray-500 mb-3">
                    {conversation.lastMessage.message_text}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(conversation.lastMessage.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {conversation.messageCount} messages
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = `/messages?conversation=${conversation.id}`
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm font-bold flex items-center gap-1 group-hover:bg-orange-100 group-hover:text-orange-700 transition-colors"
                  >
                    <Send className="h-3 w-3" />
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {conversations.length > 10 && (
          <div className="text-center mt-8">
            <a
              href="/messages"
              className="text-orange-600 hover:text-orange-500 font-open-sans font-bold"
            >
              View {conversations.length - 10} more conversations →
            </a>
          </div>
        )}
      </div>
    )
  }

  // Account Tab Component
  function AccountTab() {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="font-open-sans font-bold text-2xl text-gray-600">
                  {userProfile?.full_name?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
            <div>
              <h2 className="font-open-sans text-2xl font-bold text-gray-900">
                {userProfile?.full_name || 'Your Name'}
              </h2>
              <p className="font-open-sans text-gray-600">{currentUser?.email}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-2 ${
                currentUser?.role === 'seller' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {currentUser?.role === 'seller' ? 'Seller' : 'Buyer'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block font-open-sans font-bold text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-2" />
                Full Name
              </label>
              <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                {userProfile?.full_name || 'Not set'}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-open-sans font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                {currentUser?.email}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block font-open-sans font-bold text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                {userProfile?.phone || 'Not set'}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block font-open-sans font-bold text-gray-700 mb-2">
                Location
              </label>
              <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                {userProfile?.location || 'Not set'}
              </div>
            </div>

            {/* Account Type (Read-only) */}
            <div className="md:col-span-2">
              <label className="block font-open-sans font-bold text-gray-700 mb-2">
                Account Type
              </label>
              <div className="flex items-center gap-4">
                <span className={`inline-block px-3 py-2 rounded-lg text-sm font-bold ${
                  currentUser?.role === 'seller' 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {currentUser?.role === 'seller' ? 'Seller (Business)' : 'Buyer'}
                </span>
                <span className="font-open-sans text-sm text-gray-500">
                  {currentUser?.role === 'seller' 
                    ? 'You can create listings and manage your inventory' 
                    : 'You can browse and purchase listings'}
                </span>
              </div>
              <p className="font-open-sans text-sm text-gray-500 mt-1">
                Account type cannot be changed. Contact support if you need to change your account type.
              </p>
            </div>
          </div>

          {/* Edit Account Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <a
              href="/account"
              className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-open-sans font-bold inline-flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Account Details
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Favorites Tab Component (for buyers)
  function FavoritesTab() {
    if (loading) {
      return (
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      )
    }

    if (favorites.length === 0) {
      return (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-open-sans text-xl font-bold text-gray-900 mb-2">No favorites yet</h3>
          <p className="font-open-sans text-gray-500 mb-6">
            Start browsing listings and save the ones you like
          </p>
          <a
            href="/listings"
            className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-open-sans font-bold inline-block"
          >
            Browse Listings
          </a>
        </div>
      )
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-open-sans text-xl font-bold text-gray-900">My Favorites</h2>
          <a
            href="/favorites"
            className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-open-sans font-bold"
          >
            View All Favorites
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.slice(0, 6).map((favorite) => (
            <div key={favorite.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                {favorite.listings.image_urls && favorite.listings.image_urls.length > 0 ? (
                  <img 
                    src={favorite.listings.image_urls[0]} 
                    alt={favorite.listings.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-500 font-open-sans">No Image</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-open-sans font-bold text-lg text-gray-900 truncate">
                    {favorite.listings.title}
                  </h3>
                  <button
                    onClick={() => removeFavorite(favorite.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                    title="Remove from favorites"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="font-open-sans text-2xl font-bold text-gray-900 mb-2">
                  ${favorite.listings.price.toLocaleString()}
                </p>
                <p className="font-open-sans text-sm text-gray-600 mb-2 line-clamp-2">
                  {favorite.listings.description}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{favorite.listings.location}</span>
                  <span>{favorite.listings.category}</span>
                </div>
                <div className="mt-4">
                  <a
                    href={`/listings/${favorite.listings.id}`}
                    className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-open-sans font-bold"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {favorites.length > 6 && (
          <div className="text-center mt-8">
            <a
              href="/favorites"
              className="text-orange-600 hover:text-orange-500 font-open-sans font-bold"
            >
              View {favorites.length - 6} more favorites →
            </a>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="font-staatliches text-[54px] leading-[48px] tracking-[-1.2px] text-gray-900 mb-2">
            Hello, {userProfile?.full_name || currentUser?.full_name || 'there'}
          </h1>
          <p className="font-open-sans text-lg text-gray-500">
            {currentUser?.role === 'seller' 
              ? 'Manage your listings and track performance'
              : 'Manage your favorites and messages'}
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <p className="font-open-sans text-sm">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-green-700 hover:text-green-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Stripe Account Alert for Sellers */}
        {currentUser?.role === 'seller' && stripeAccountStatus && !stripeAccountStatus.isComplete && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-8">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-open-sans text-sm font-semibold">Payment Setup Required</p>
                <p className="font-open-sans text-sm">
                  Connect your Stripe account to start receiving payments from buyers.
                </p>
              </div>
              <div className="ml-auto">
                <ConnectAccountButton 
                  onSuccess={() => fetchStripeStatus()}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Connect Now
                </ConnectAccountButton>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {currentUser?.role === 'seller' ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-open-sans text-sm text-gray-500">Total Listings</p>
                  <p className="font-open-sans text-2xl font-bold text-gray-900">{stats.totalListings}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-open-sans text-sm text-gray-500">Active</p>
                  <p className="font-open-sans text-2xl font-bold text-gray-900">{stats.activeListing}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-open-sans text-sm text-gray-500">Sold</p>
                  <p className="font-open-sans text-2xl font-bold text-gray-900">{stats.soldListings}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-open-sans text-sm text-gray-500">Total Value</p>
                  <p className="font-open-sans text-2xl font-bold text-gray-900">${stats.totalValue.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            {/* Stripe Account Status Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  stripeAccountStatus?.isComplete 
                    ? 'bg-green-100' 
                    : stripeAccountStatus?.hasStripeAccount 
                      ? 'bg-yellow-100' 
                      : 'bg-red-100'
                }`}>
                  <CreditCard className={`h-6 w-6 ${
                    stripeAccountStatus?.isComplete 
                      ? 'text-green-600' 
                      : stripeAccountStatus?.hasStripeAccount 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <p className="font-open-sans text-sm text-gray-500">Payment Status</p>
                  <p className="font-open-sans text-lg font-bold text-gray-900">
                    {stripeAccountStatus?.isComplete 
                      ? 'Connected' 
                      : stripeAccountStatus?.hasStripeAccount 
                        ? 'Setup Required' 
                        : 'Not Connected'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="font-open-sans text-sm text-gray-500">Total Favorites</p>
                  <p className="font-open-sans text-2xl font-bold text-gray-900">{buyerStats.totalFavorites}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-open-sans text-sm text-gray-500">Added This Week</p>
                  <p className="font-open-sans text-2xl font-bold text-gray-900">{buyerStats.recentFavorites}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-open-sans text-sm text-gray-500">Messages</p>
                  <p className="font-open-sans text-2xl font-bold text-gray-900">
                    <a href="/messages" className="hover:text-orange-600">View All</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {(currentUser?.role === 'seller' ? [
              { id: 'listings', label: 'My Listings', icon: Eye },
              { id: 'payments', label: 'Payment Setup', icon: CreditCard },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
              { id: 'analytics', label: 'Analytics', icon: DollarSign },
              { id: 'account', label: 'Account', icon: User }
            ] : [
              { id: 'favorites', label: 'My Favorites', icon: Heart },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
              { id: 'account', label: 'Account', icon: User }
            ]).map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-open-sans font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'account' && (
          <AccountTab />
        )}

        {activeTab === 'favorites' && currentUser?.role === 'buyer' && (
          <FavoritesTab />
        )}

        {activeTab === 'listings' && currentUser?.role === 'seller' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-open-sans text-xl font-bold text-gray-900">My Listings</h2>
              <a
                href="/dashboard/create-listing"
                className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-open-sans font-bold flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Listing
              </a>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16">
                <Plus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-open-sans text-xl font-bold text-gray-900 mb-2">No listings yet</h3>
                <p className="font-open-sans text-gray-500 mb-6">
                  Create your first listing to start selling equipment
                </p>
                <a
                  href="/dashboard/create-listing"
                  className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-open-sans font-bold inline-block"
                >
                  Create First Listing
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-open-sans font-bold text-lg text-gray-900">
                            {listing.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            listing.is_sold 
                              ? 'bg-gray-100 text-gray-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {listing.is_sold ? 'Sold' : 'Active'}
                          </span>
                        </div>
                        <p className="font-open-sans text-gray-600 mb-2">{listing.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>${listing.price.toLocaleString()}</span>
                          <span>{listing.location}</span>
                          <span>{listing.category}</span>
                          <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <a
                          href={`/listings/${listing.id}`}
                          className="p-2 text-gray-500 hover:text-gray-700"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <a
                          href={`/dashboard/edit-listing/${listing.id}`}
                          className="p-2 text-gray-500 hover:text-gray-700"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => toggleSoldStatus(listing.id, listing.is_sold)}
                          className={`px-3 py-1 rounded text-sm font-bold ${
                            listing.is_sold
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {listing.is_sold ? 'Mark Available' : 'Mark Sold'}
                        </button>
                        <button
                          onClick={() => deleteListing(listing.id)}
                          className="p-2 text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <MessagesTab currentUser={currentUser} />
        )}

        {activeTab === 'payments' && currentUser?.role === 'seller' && (
          <div>
            <div className="mb-6">
              <h2 className="font-open-sans text-xl font-bold text-gray-900 mb-2">Payment Setup</h2>
              <p className="font-open-sans text-gray-600">
                Connect your Stripe account to receive payments directly from buyers.
              </p>
            </div>
            
            <StripeAccountStatus 
              showDetails={true}
              className="mb-6"
            />
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="font-open-sans text-lg font-bold text-gray-900 mb-3">How Payments Work</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs">1</div>
                  <p>Connect your Stripe account to enable direct payments</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs">2</div>
                  <p>Buyers purchase your items through secure Stripe Checkout</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs">3</div>
                  <p>Money goes directly to your bank account (no platform fees currently)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs">4</div>
                  <p>Your listing is automatically marked as sold</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && currentUser?.role === 'seller' && (
          <div className="text-center py-16">
            <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-open-sans text-xl font-bold text-gray-900 mb-2">Analytics</h3>
            <p className="font-open-sans text-gray-500">
              Analytics and reporting will be implemented here
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

// Loading component for Suspense fallback
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-16 bg-gray-200 rounded-lg w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// Main page component with Suspense boundary
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
} 