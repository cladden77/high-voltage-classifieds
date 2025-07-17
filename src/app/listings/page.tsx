'use client'

import React, { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Sample listings data
const sampleListings = [
  {
    id: 1,
    title: "500 kVA Power Transformer",
    description: "Excellent condition 500 kVA power transformer. Recently tested and certified. Includes all…",
    price: 45000.00,
    location: "Houston, TX",
    category: "Transformers",
    condition: "Excellent",
    datePosted: "7/10/2025",
    image: null
  },
  {
    id: 2,
    title: "15 kV Vacuum Circuit Breaker",
    description: "High-quality 15 kV vacuum circuit breaker in like-new condition. Includes control panel and ...",
    price: 12500.00,
    location: "Houston, TX",
    category: "Breakers",
    condition: "Like New",
    datePosted: "7/10/2025",
    image: null
  },
  {
    id: 3,
    title: "1000 HP Electric Motor",
    description: "Industrial-grade 1000 HP electric motor. Good working condition with recent maintenance…",
    price: 28000.00,
    location: "Houston, TX",
    category: "Motors",
    condition: "Good",
    datePosted: "7/10/2025",
    image: null
  },
  {
    id: 4,
    title: "Medium Voltage Switchgear",
    description: "Complete medium voltage switchgear panel. Includes protective relays, control systems, and…",
    price: 75000.00,
    location: "Houston, TX",
    category: "Switchgear",
    condition: "Excellent",
    datePosted: "7/10/2025",
    image: null
  },
  {
    id: 5,
    title: "Generator Control Panel",
    description: "Advanced generator control panel with automatic transfer switch capabilities. Fair condition, suitabl…",
    price: 8500.00,
    location: "Houston, TX",
    category: "Panels",
    condition: "Fair",
    datePosted: "7/10/2025",
    image: null
  }
]

export default function ListingsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent':
      case 'Like New':
      case 'Good':
        return 'bg-green-100 text-green-800'
      case 'Fair':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
          <div className="flex gap-4 items-center">
            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-open-sans text-sm"
              />
              <svg
                className="absolute left-3 top-3 h-4 w-4 text-gray-400"
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
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 px-3 pr-8 border border-gray-200 rounded bg-white font-open-sans text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
              >
                <option>All Categories</option>
                <option>Transformers</option>
                <option>Breakers</option>
                <option>Motors</option>
                <option>Switchgear</option>
                <option>Panels</option>
              </select>
              <svg
                className="absolute right-2 top-3 h-4 w-4 text-gray-500 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Location Filter */}
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="h-10 px-3 pr-8 border border-gray-200 rounded bg-white font-open-sans text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
              >
                <option>All Locations</option>
                <option>Houston, TX</option>
                <option>Dallas, TX</option>
                <option>Austin, TX</option>
              </select>
              <svg
                className="absolute right-2 top-3 h-4 w-4 text-gray-500 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Search Button */}
            <button className="h-10 px-8 bg-gray-900 text-white rounded font-open-sans text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              SEARCH
            </button>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="font-open-sans text-gray-500">
            Showing 5 results
          </p>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
            <span className="font-open-sans text-sm text-gray-500">Sort by relevance</span>
          </div>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sampleListings.map((listing) => (
            <div key={listing.id} className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
              {/* Image Placeholder */}
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-open-sans">No Image</span>
              </div>
              
              {/* Card Content */}
              <div className="p-6">
                {/* Condition and Date */}
                <div className="flex justify-between items-center mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-open-sans font-bold ${getConditionColor(listing.condition)}`}>
                    {listing.condition}
                  </span>
                  <span className="text-sm font-open-sans font-bold text-gray-500">
                    {listing.datePosted}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-open-sans font-bold text-lg text-gray-900 mb-2 leading-7">
                  {listing.title}
                </h3>

                {/* Description */}
                <p className="font-open-sans text-sm text-gray-500 mb-3 leading-5">
                  {listing.description}
                </p>

                {/* Price and Location */}
                <div className="flex justify-between items-center mb-3">
                  <span className="font-open-sans font-bold text-2xl text-gray-900">
                    ${listing.price.toLocaleString()}.00
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
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-open-sans font-bold text-sm uppercase transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <span className="font-open-sans text-gray-500">1   2   3   4   5   6   7   8...</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
} 