'use client'

import React, { useState } from "react";
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const [searchKeywords, setSearchKeywords] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const router = useRouter()

  const categories = [
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Build URL parameters
    const params = new URLSearchParams()
    
    if (searchKeywords.trim()) {
      params.set('search', searchKeywords.trim())
    }
    
    if (selectedCategory && selectedCategory !== '') {
      params.set('category', selectedCategory)
    }
    
    // Navigate to listings page with search parameters
    const queryString = params.toString()
    const url = queryString ? `/listings?${queryString}` : '/listings'
    router.push(url)
  }

  return (
    <section className="bg-[#ffffff] relative">
      <div className="absolute inset-0 bg-[#1b1b1b] opacity-80"></div>
      <div className="relative bg-gradient-to-b from-[#1b1b1b] to-[#1b1b1b] min-h-[540px] flex items-center justify-center px-4 py-16">
        <div className="text-center">
          <h1 className="font-staatliches text-white text-4xl md:text-6xl lg:text-8xl tracking-[-1.8px] mb-4">
            <span className="block">BUY & SELL SURPLUS</span>
            <div className="flex">
              <span className="block text-[#f37121]">HIGH VOLTAGE</span>
              <span className="pl-2">EQUIPMENT</span>
              </div>
          </h1>
          <p className="text-white text-lg md:text-xl lg:text-2xl mb-8 mx-auto">
            A trusted platform for contractors, utilities, and solar providers
          </p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-[rgba(255,255,255,0.9)] rounded-lg p-4 max-w-[672px] mx-auto">
            <div className="flex flex-col lg:flex-row gap-3">
              <input
                type="text"
                placeholder="Search keywords..."
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                className="flex-1 bg-neutral-100 border border-neutral-200 rounded px-4 py-3 text-[#1b1b1b] placeholder:text-[#a1a1a1] focus:outline-none focus:ring-2 focus:ring-[#f37121] focus:border-transparent"
              />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-neutral-100 border border-neutral-200 rounded px-4 py-3 text-[#1b1b1b] min-w-[120px] focus:outline-none focus:ring-2 focus:ring-[#f37121] focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <button 
                type="submit"
                className="bg-[#f37121] text-white px-6 py-3 rounded font-bold uppercase hover:bg-[#e55a0a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f37121] focus:ring-offset-2"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
} 