'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClientSupabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";
import { formatPrice } from '@/lib/format';

type Listing = Database['public']['Tables']['listings']['Row'];

export default function FeaturedListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestListings();
  }, []);

  const fetchLatestListings = async () => {
    try {
      const supabase = createClientSupabase();
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('is_sold', false) // Only show available listings
        .order('created_at', { ascending: false })
        .limit(4); // Get the 4 most recent listings

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching latest listings:', error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <section className="bg-neutral-50 px-4 lg:px-20 py-16">
      <div className="max-w-[1280px] mx-auto">
        <h2 className="font-staatliches text-gray-900 text-4xl md:text-5xl text-center tracking-[-1.2px] leading-tight mb-8">
          Latest Listings
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="block bg-white rounded-lg shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] border border-neutral-200 overflow-hidden">
                <div className="bg-neutral-100 h-40 flex items-center justify-center">
                  <div className="animate-pulse bg-neutral-300 h-8 w-32 rounded"></div>
                </div>
                <div className="p-4">
                  <div className="animate-pulse bg-neutral-300 h-6 w-full rounded mb-2"></div>
                  <div className="animate-pulse bg-neutral-300 h-4 w-24 rounded mb-2"></div>
                  <div className="animate-pulse bg-neutral-300 h-6 w-20 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {listings.map((listing) => (
              <Link 
                key={listing.id} 
                href={`/listings/${listing.id}`}
                className="block bg-white rounded-lg shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] border border-neutral-200 overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
              >
                <div className="bg-neutral-100 h-40 flex items-center justify-center">
                  {listing.image_urls && listing.image_urls.length > 0 ? (
                    <img 
                      src={listing.image_urls[0]} 
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[#666] opacity-80 text-center px-4">{listing.title}</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">{listing.title}</h3>
                  <p className="text-[#928c8e] text-sm mb-2">{listing.location}</p>
                  <p className="text-[#f37121] text-xl font-bold">{formatPrice(listing.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No listings available at the moment.</p>
            <p className="text-gray-400 text-sm mt-2">Check back soon for new listings!</p>
          </div>
        )}
        
        <div className="text-center">
          <Link href="/listings" className="inline-block bg-[#f37121] text-white px-6 py-2 rounded font-bold uppercase hover:bg-[#e55a0a] transition-colors">
            View All Listings
          </Link>
        </div>
      </div>
    </section>
  );
} 