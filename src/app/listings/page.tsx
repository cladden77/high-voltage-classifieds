'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { X, RotateCcw } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClientSupabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { formatCondition } from '@/lib/utils'

// Force dynamic rendering for this page  
export const dynamic = 'force-dynamic'

type Listing = Database['public']['Tables']['listings']['Row']

// Separate component for search parameter handling
function ListingsContent() {
  const [listings, setListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')
  const [sortBy, setSortBy] = useState('newest')

  const searchParams = useSearchParams()

  // Initialize search state from URL parameters
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    const urlCategory = searchParams.get('category')
    
    if (urlSearch) {
      setSearchTerm(urlSearch)
    }
    
    if (urlCategory) {
      setSelectedCategory(urlCategory)
    }
  }, [searchParams])

  const categories = [
    'All Categories',
    'Transformers',
    'Breakers', 
    'Motors',
    'Switchgear',
    'Panels',
    'Cables',
    'Generators',
    'Insulators',
    'Protective Equipment',
    'Testing Equipment',
    'Other'
  ]

  useEffect(() => {
    fetchListings()
  }, [])

  useEffect(() => {
    filterListings()
  }, [listings, searchTerm, selectedCategory, selectedLocation, sortBy])

  const fetchListings = async () => {
    try {
      const supabase = createClientSupabase()
      let query = supabase
        .from('listings')
        .select('*')
        .eq('is_sold', false) // Only show available listings

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'price_low':
          query = query.order('price', { ascending: true })
          break
        case 'price_high':
          query = query.order('price', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error
      setListings(data || [])
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterListings = () => {
    let filtered = [...listings]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(listing => listing.category === selectedCategory)
    }

    // Filter by location
    if (selectedLocation !== 'All Locations') {
      filtered = filtered.filter(listing => listing.location === selectedLocation)
    }

    setFilteredListings(filtered)
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800'
      case 'used': return 'bg-yellow-100 text-yellow-800'
      case 'refurbished': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get unique locations for filter dropdown
  const locations = ['All Locations', ...Array.from(new Set(listings.map(listing => listing.location)))]

  // Clear all filters function
  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedCategory('All Categories')
    setSelectedLocation('All Locations')
    setSortBy('newest')
  }

  // Check if any filters are applied
  const hasActiveFilters = searchTerm || selectedCategory !== 'All Categories' || selectedLocation !== 'All Locations' || sortBy !== 'newest'

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
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-staatliches text-[54px] leading-[48px] tracking-[-1.2px] text-gray-900 mb-2">
              Equipment Listings
            </h1>
            <p className="font-open-sans text-lg text-gray-500">
              Find the perfect equipment for your business
            </p>
          </div>

                  {/* Search Section */}
          <div className="bg-white border border-gray-200 rounded-md shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-open-sans text-lg font-bold text-gray-900">Filter Equipment</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-open-sans font-bold transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear All Filters
                </button>
              )}
            </div>
            
                        <div className="space-y-4">
              {/* Search Input - Full width on all devices */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 pl-10 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-open-sans text-sm"
                />
                <svg
                  className="absolute left-3 top-4 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Dropdowns - Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-12 px-3 pr-8 border border-gray-200 rounded-lg bg-white font-open-sans text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-2 top-4 h-4 w-4 text-gray-500 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {selectedCategory !== 'All Categories' && (
                    <button
                      onClick={() => setSelectedCategory('All Categories')}
                      className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1 hover:bg-orange-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Location Filter */}
                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full h-12 px-3 pr-8 border border-gray-200 rounded-lg bg-white font-open-sans text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                  >
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-2 top-4 h-4 w-4 text-gray-500 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {selectedLocation !== 'All Locations' && (
                    <button
                      onClick={() => setSelectedLocation('All Locations')}
                      className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1 hover:bg-orange-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Sort Filter */}
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-12 px-3 pr-8 border border-gray-200 rounded-lg bg-white font-open-sans text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                  <svg
                    className="absolute right-2 top-4 h-4 w-4 text-gray-500 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {sortBy !== 'newest' && (
                    <button
                      onClick={() => setSortBy('newest')}
                      className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1 hover:bg-orange-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
        </div>

                  {/* Results Header */}
          <div className="flex justify-between items-center mb-6">
            <p className="font-open-sans text-gray-500">
              Showing {filteredListings.length} results
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>

          {/* Equipment Grid */}
          {filteredListings.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="font-open-sans text-xl font-bold text-gray-900 mb-2">No listings found</h3>
              <p className="font-open-sans text-gray-500">Try adjusting your search criteria</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                {/* Image */}
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {listing.image_urls && listing.image_urls.length > 0 ? (
                    <img 
                      src={listing.image_urls[0]} 
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 font-open-sans">No Image</span>
                  )}
                </div>
                
                {/* Card Content */}
                <div className="p-6">
                  {/* Condition and Date */}
                  <div className="flex justify-between items-center mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-open-sans font-bold ${getConditionColor(listing.condition)}`}>
                      {formatCondition(listing.condition)}
                    </span>
                    <span className="text-sm font-open-sans font-bold text-gray-500">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-open-sans font-bold text-lg text-gray-900 mb-2 leading-7">
                    {listing.title}
                  </h3>

                  {/* Description */}
                  <p className="font-open-sans text-sm text-gray-500 mb-3 leading-5">
                    {listing.description.length > 100 
                      ? `${listing.description.substring(0, 100)}...` 
                      : listing.description
                    }
                  </p>

                  {/* Price and Location */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-open-sans font-bold text-2xl text-gray-900">
                      ${listing.price.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-open-sans font-bold text-sm text-gray-500">
                        {listing.location}
                      </span>
                    </div>
                  </div>

                  {/* Category and View Details */}
                  <div className="flex justify-between items-center">
                    <span className="font-open-sans font-bold text-sm text-gray-500">
                      {listing.category}
                    </span>
                    <a
                      href={`/listings/${listing.id}`}
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

// Loading fallback component
function ListingsLoading() {
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

export default function ListingsPage() {
  return (
    <Suspense fallback={<ListingsLoading />}>
      <ListingsContent />
    </Suspense>
  )
} 