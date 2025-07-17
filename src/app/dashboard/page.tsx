'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, MessageSquare, Eye, DollarSign } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClientSupabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type Listing = Database['public']['Tables']['listings']['Row']

export default function DashboardPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'listings' | 'messages' | 'analytics'>('listings')
  const supabase = createClientSupabase()

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      // TODO: Filter by current user's seller_id when auth is implemented
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setListings(data || [])
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteListing = async (listingId: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      try {
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

  const stats = {
    totalListings: listings.length,
    activeListing: listings.filter(l => !l.is_sold).length,
    soldListings: listings.filter(l => l.is_sold).length,
    totalValue: listings.reduce((sum, l) => sum + l.price, 0)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="font-staatliches text-[54px] leading-[48px] tracking-[-1.2px] text-gray-900 mb-2">
            Seller Dashboard
          </h1>
          <p className="font-open-sans text-lg text-gray-500">
            Manage your listings and track performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'listings', label: 'My Listings', icon: Eye },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
              { id: 'analytics', label: 'Analytics', icon: DollarSign }
            ].map((tab) => {
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
        {activeTab === 'listings' && (
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
                        <button
                          onClick={() => {/* TODO: Implement edit */}}
                          className="p-2 text-gray-500 hover:text-gray-700"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
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
          <div className="text-center py-16">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-open-sans text-xl font-bold text-gray-900 mb-2">Messages</h3>
            <p className="font-open-sans text-gray-500">
              Message management will be implemented here
            </p>
          </div>
        )}

        {activeTab === 'analytics' && (
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