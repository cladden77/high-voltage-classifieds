"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-[#1b1b1b] h-[95px] sticky top-0 z-50 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
      <div className="box-border content-stretch flex flex-col items-center justify-center overflow-clip pb-px pt-0 px-4 lg:px-20 relative size-full">
        <nav className="box-border content-stretch flex flex-row gap-4 lg:gap-[323px] items-center justify-between max-w-[1280px] overflow-clip px-0 py-4 relative shrink-0 w-full">
          <div className="box-border content-stretch flex flex-row gap-4 lg:gap-[38px] items-center justify-start p-0 relative shrink-0">
            {/* Logo */}
            <div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0">
              <div className="h-12 overflow-clip relative shrink-0 w-44">
                <div className="flex items-center h-full">
                  <span className="text-white font-staatliches text-xl lg:text-2xl font-bold">
                    HIGH VOLTAGE
                  </span>
                </div>
                <div className="text-[#928c8e] text-xs mt-1">
                  CLASSIFIEDS
                </div>
              </div>
            </div>
            
            {/* Navigation Links - Hidden on mobile */}
            <div className="hidden lg:flex flex-row gap-6 items-center">
              <Link href="/listings" className="text-neutral-100 text-sm font-bold uppercase hover:text-[#f37121] transition-colors">
                Browse Listings
              </Link>
              <a href="#" className="text-neutral-100 text-sm font-bold uppercase hover:text-[#f37121] transition-colors">
                Post an Ad
              </a>
              <a href="#" className="text-neutral-100 text-sm font-bold uppercase hover:text-[#f37121] transition-colors">
                Blog
              </a>
              <a href="#" className="text-neutral-100 text-sm font-bold uppercase hover:text-[#f37121] transition-colors">
                Contact
              </a>
            </div>
          </div>
          
          {/* Right side navigation */}
          <div className="flex flex-row gap-4 items-center">
            <span className="hidden lg:block text-neutral-100 text-base font-bold">
              Sign In
            </span>
            <button className="bg-[#f37121] text-white px-3 lg:px-5 py-2 rounded shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] text-xs lg:text-base font-bold uppercase hover:bg-[#e55a0a] transition-colors">
              Post Listing
            </button>
            
            {/* Mobile menu button */}
            <button 
              className="lg:hidden text-white p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-[#1b1b1b] border-t border-neutral-800 py-4 px-4">
            <div className="flex flex-col space-y-4">
              <Link href="/listings" className="text-neutral-100 text-sm font-bold uppercase hover:text-[#f37121] transition-colors">
                Browse Listings
              </Link>
              <a href="#" className="text-neutral-100 text-sm font-bold uppercase hover:text-[#f37121] transition-colors">
                Post an Ad
              </a>
              <a href="#" className="text-neutral-100 text-sm font-bold uppercase hover:text-[#f37121] transition-colors">
                Blog
              </a>
              <a href="#" className="text-neutral-100 text-sm font-bold uppercase hover:text-[#f37121] transition-colors">
                Contact
              </a>
              <a href="#" className="text-neutral-100 text-sm font-bold uppercase hover:text-[#f37121] transition-colors border-t border-neutral-800 pt-4">
                Sign In
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 