'use client'

import React, { useState, useEffect } from 'react'
import { Heart, Trash2 } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClientSupabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

type FavoriteWithListing = {
  id: string
  listing_id: string
  created_at: string
  listings: Database['public']['Tables']['listings']['Row']
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteWithListing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      const supabase = createClientSupabase()
      // TODO: Get current user and filter by user_id
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          listings (*)
        `)
        // .eq('user_id', user.id) // Add when auth is implemented

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
              ))}
            </div>
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
        <div className="mb-8">
          <h1 className="font-staatliches text-[54px] leading-[48px] tracking-[-1.2px] text-gray-900 mb-2">
            My Favorites
          </h1>
          <p className="font-open-sans text-lg text-gray-500">
            Equipment you've saved for later
          </p>
        </div>

        {favorites.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                {/* Image */}
                <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                  {favorite.listings.images && favorite.listings.images.length > 0 ? (
                    <img 
                      src={favorite.listings.images[0]} 
                      alt={favorite.listings.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 font-open-sans">No Image</span>
                  )}
                  
                  {/* Remove Favorite Button */}
                  <button
                    onClick={() => removeFavorite(favorite.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
                
                {/* Card Content */}
                <div className="p-6">
                  {/* Condition */}
                  <div className="mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-open-sans font-bold ${
                      favorite.listings.condition === 'new' ? 'bg-green-100 text-green-800' :
                      favorite.listings.condition === 'used' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {favorite.listings.condition}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-open-sans font-bold text-lg text-gray-900 mb-2 leading-7">
                    {favorite.listings.title}
                  </h3>

                  {/* Description */}
                  <p className="font-open-sans text-sm text-gray-500 mb-3 leading-5 line-clamp-2">
                    {favorite.listings.description}
                  </p>

                  {/* Price and Location */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-open-sans font-bold text-2xl text-gray-900">
                      ${favorite.listings.price.toLocaleString()}
                    </span>
                    <span className="font-open-sans text-sm text-gray-500">
                      {favorite.listings.location}
                    </span>
                  </div>

                  {/* Category and View Details */}
                  <div className="flex justify-between items-center">
                    <span className="font-open-sans font-bold text-sm text-gray-500">
                      {favorite.listings.category}
                    </span>
                    <a
                      href={`/listings/${favorite.listings.id}`}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-open-sans font-bold text-sm uppercase transition-colors"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
} 