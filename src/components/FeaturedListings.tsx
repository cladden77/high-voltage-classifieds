import React from "react";
import Link from "next/link";

export default function FeaturedListings() {
  const listings = [
    {
      id: 1,
      title: "15kV Power Transformer",
      location: "Houston, TX",
      price: "$4,500"
    },
    {
      id: 2,
      title: "High Voltage Switchgear",
      location: "Chicago, IL",
      price: "$2,800"
    },
    {
      id: 3,
      title: "Industrial Cable Spools",
      location: "Phoenix, AZ",
      price: "$1,200"
    },
    {
      id: 4,
      title: "Insulated Tools Set",
      location: "Atlanta, GA",
      price: "$650"
    }
  ];

  return (
    <section className="bg-neutral-50 px-4 lg:px-20 py-16">
      <div className="max-w-[1280px] mx-auto">
        <h2 className="font-staatliches text-gray-900 text-4xl md:text-5xl text-center tracking-[-1.2px] leading-tight mb-8">
          Featured Listings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {listings.map((listing) => (
            <Link 
              key={listing.id} 
              href={`/listings/${listing.id}`}
              className="block bg-white rounded-lg shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] border border-neutral-200 overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
            >
              <div className="bg-neutral-100 h-40 flex items-center justify-center">
                <span className="text-[#666] opacity-80 text-center px-4">{listing.title}</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{listing.title}</h3>
                <p className="text-[#928c8e] text-sm mb-2">{listing.location}</p>
                <p className="text-[#f37121] text-xl font-bold">{listing.price}</p>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center">
          <Link href="/listings" className="inline-block bg-[#f37121] text-white px-6 py-2 rounded font-bold uppercase hover:bg-[#e55a0a] transition-colors">
            View All Listings
          </Link>
        </div>
      </div>
    </section>
  );
} 