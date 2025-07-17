"use client";

import React, { useState } from "react";

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div
      className="bg-[#ffffff] relative min-h-screen"
      data-name="Home Page Option 1 - 1440w"
    >
      {/* Header */}
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
                <a href="#" className="text-neutral-100 text-sm font-bold uppercase hover:text-[#f37121] transition-colors">
                  Browse Listings
                </a>
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
                <a href="#" className="text-neutral-100 text-sm font-bold uppercase hover:text-[#f37121] transition-colors">
                  Browse Listings
                </a>
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

      <main>
        {/* Hero Section */}
        <section className="bg-[#ffffff] relative">
          <div className="absolute inset-0 bg-[#1b1b1b] opacity-80"></div>
          <div className="relative bg-gradient-to-b from-[#1b1b1b] to-[#1b1b1b] min-h-[540px] flex items-center justify-center px-4 py-16">
            <div className="max-w-[672px] text-center">
              <h1 className="font-staatliches text-white text-4xl md:text-6xl lg:text-8xl leading-tight tracking-[-1.8px] mb-4">
                <span className="block">Buy & Sell Surplus</span>
                <span className="text-[#f37121]">High Voltage</span> Equipment
              </h1>
              <p className="text-white text-lg md:text-xl lg:text-2xl mb-8 max-w-[546px] mx-auto">
                A trusted platform for contractors, utilities, and solar providers
              </p>
              
              {/* Search Form */}
              <div className="bg-[rgba(255,255,255,0.9)] rounded-lg p-4">
                <div className="flex flex-col lg:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Search keywords..."
                    className="flex-1 bg-neutral-100 border border-neutral-200 rounded px-4 py-3 text-[#1b1b1b] placeholder:text-[#a1a1a1]"
                  />
                  <select className="bg-neutral-100 border border-neutral-200 rounded px-4 py-3 text-[#1b1b1b] min-w-[120px]">
                    <option>Category</option>
                    <option>Transformers</option>
                    <option>Switchgear</option>
                    <option>Cables</option>
                    <option>Tools</option>
                  </select>
                  <button className="bg-[#f37121] text-white px-6 py-3 rounded font-bold uppercase hover:bg-[#e55a0a] transition-colors">
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        <section className="bg-neutral-50 px-4 lg:px-20 py-16">
          <div className="max-w-[1280px] mx-auto">
            <h2 className="font-staatliches text-gray-900 text-3xl md:text-4xl lg:text-5xl text-center tracking-[-1.2px] leading-tight mb-8">
              Featured Listings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Listing Card 1 */}
              <div className="bg-white rounded-lg shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-neutral-100 h-40 flex items-center justify-center">
                  <span className="text-[#666] opacity-80 text-center px-4">15kV Power Transformer</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">15kV Power Transformer</h3>
                  <p className="text-[#928c8e] text-sm mb-2">Houston, TX</p>
                  <p className="text-[#f37121] text-xl font-bold">$4,500</p>
                </div>
              </div>

              {/* Listing Card 2 */}
              <div className="bg-white rounded-lg shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-neutral-100 h-40 flex items-center justify-center">
                  <span className="text-[#666] opacity-80 text-center px-4">High Voltage Switchgear</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">High Voltage Switchgear</h3>
                  <p className="text-[#928c8e] text-sm mb-2">Chicago, IL</p>
                  <p className="text-[#f37121] text-xl font-bold">$2,800</p>
                </div>
              </div>

              {/* Listing Card 3 */}
              <div className="bg-white rounded-lg shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-neutral-100 h-40 flex items-center justify-center">
                  <span className="text-[#666] opacity-80 text-center px-4">Industrial Cable Spools</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Industrial Cable Spools</h3>
                  <p className="text-[#928c8e] text-sm mb-2">Phoenix, AZ</p>
                  <p className="text-[#f37121] text-xl font-bold">$1,200</p>
                </div>
              </div>

              {/* Listing Card 4 */}
              <div className="bg-white rounded-lg shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-neutral-100 h-40 flex items-center justify-center">
                  <span className="text-[#666] opacity-80 text-center px-4">Insulated Tools Set</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Insulated Tools Set</h3>
                  <p className="text-[#928c8e] text-sm mb-2">Atlanta, GA</p>
                  <p className="text-[#f37121] text-xl font-bold">$650</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <button className="bg-[#f37121] text-white px-6 py-2 rounded font-bold uppercase hover:bg-[#e55a0a] transition-colors">
                View All Listings
              </button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-white px-4 lg:px-20 py-16">
          <div className="max-w-[1280px] mx-auto">
            <h2 className="font-staatliches text-gray-900 text-3xl md:text-4xl lg:text-5xl text-center tracking-[-1.2px] leading-tight mb-10">
              How It Works
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white rounded-lg shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] border border-neutral-200 p-6 lg:p-8 text-center">
                <div className="w-10 h-10 mx-auto mb-4 text-[#ef4744]">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 40 40">
                    <path d="M8 25.3333L13.3333 32L18.6667 25.3333M18.6667 17V2M8 8.66667V12C8 13.7681 8.70238 15.4638 9.95262 16.714C11.2029 17.9643 12.8986 18.6667 14.6667 18.6667H18.6667" stroke="currentColor" strokeWidth="3.33333" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-2">Find Equipment</h3>
                <p className="text-[#928c8e] leading-6">
                  Browse a wide range of surplus high-voltage equipment from trusted sellers across the country.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-neutral-900 rounded-lg shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] border border-neutral-800 p-6 lg:p-8 text-center">
                <div className="w-10 h-10 mx-auto mb-4 text-[#ef4744]">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 40 40">
                    <path d="M20 2V38.6667M38.6667 20.3333H2" stroke="currentColor" strokeWidth="3.33333" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-bold text-white text-xl mb-2">Post Listings</h3>
                <p className="text-white leading-6">
                  List your surplus gear in minutes. Reach thousands of contractors, utilities, and industrial pros.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-lg shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] border border-neutral-200 p-6 lg:p-8 text-center">
                <div className="w-10 h-10 mx-auto mb-4 text-[#ef4744]">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 40 40">
                    <path d="M27 12H35.3333V8.66667C35.3333 6.89856 34.631 5.20286 33.3807 3.95262C32.1305 2.70238 30.4348 2 28.6667 2H8.66667C6.89856 2 5.20286 2.70238 3.95262 3.95262C2.70238 5.20286 2 6.89856 2 8.66667V12H10.3333" stroke="currentColor" strokeWidth="3.33333" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-2">Connect & Close</h3>
                <p className="text-[#928c8e] leading-6">
                  Message sellers, negotiate deals, and close transactions securely on a platform built for pros.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="bg-neutral-950 px-4 lg:px-[272px] py-16 text-center border-t border-neutral-800">
          <div className="max-w-[896px] mx-auto">
            <div className="bg-[#ef4744] text-white text-xs font-bold uppercase tracking-[0.6px] px-3 py-1 rounded-full inline-flex items-center mb-4">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 20 20">
                <path d="M1 11L6.33333 16.3333L19 3.66667" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Powered by Professionals
            </div>
            <h2 className="font-staatliches text-[#f37121] text-3xl md:text-4xl lg:text-5xl tracking-[-1.2px] leading-tight mb-4">
              Built for Trust, Speed, and Reliability
            </h2>
            <p className="text-white text-base lg:text-lg leading-7 max-w-[668px] mx-auto">
              High Voltage Classifieds is the go-to marketplace for contractors and industrial pros. 
              Our platform is designed for fast, secure transactions and is trusted by thousands in 
              the high-voltage industry.
            </p>
          </div>
        </section>

        {/* From the Blog */}
        <section className="bg-neutral-50 px-4 lg:px-20 py-16">
          <div className="max-w-[1280px] mx-auto">
            <h2 className="font-staatliches text-[#1b1b1b] text-3xl md:text-4xl lg:text-5xl text-center tracking-[-1.2px] leading-tight mb-10">
              From the Blog
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Blog Card 1 */}
              <div className="bg-white rounded-lg shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:h-64">
                  <div className="bg-neutral-100 w-full lg:w-40 h-40 lg:h-full flex-shrink-0"></div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-[#1b1b1b] text-lg leading-7 mb-2">
                        How to Inspect Surplus Transformers
                      </h3>
                      <p className="text-neutral-600 leading-6 mb-4">
                        A step-by-step guide for contractors and buyers to safely evaluate used high-voltage transformers.
                      </p>
                    </div>
                    <a href="#" className="text-[#ef4744] font-bold hover:underline">
                      Read More →
                    </a>
                  </div>
                </div>
              </div>

              {/* Blog Card 2 */}
              <div className="bg-white rounded-lg shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:h-64">
                  <div className="bg-neutral-100 w-full lg:w-40 h-40 lg:h-full flex-shrink-0"></div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-[#1b1b1b] text-lg leading-7 mb-2">
                        Top 5 Safety Tips for High Voltage Work
                      </h3>
                      <p className="text-neutral-600 leading-6 mb-4">
                        Essential safety practices for working with and around high-voltage equipment in the field.
                      </p>
                    </div>
                    <a href="#" className="text-[#ef4744] font-bold hover:underline">
                      Read More →
                    </a>
                  </div>
                </div>
              </div>

              {/* Blog Card 3 */}
              <div className="bg-white rounded-lg shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:h-64">
                  <div className="bg-neutral-100 w-full lg:w-40 h-40 lg:h-full flex-shrink-0"></div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-[#1b1b1b] text-lg leading-7 mb-2">
                        Selling Surplus Gear: What You Need to Know
                      </h3>
                      <p className="text-[#928c8e] leading-6 mb-4">
                        Best practices for listing, pricing, and closing deals on surplus industrial equipment.
                      </p>
                    </div>
                    <a href="#" className="text-[#f0b100] font-bold hover:underline">
                      Read More →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-[#f37121] px-4 lg:px-52 py-10">
          <div className="max-w-[1024px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
            <h2 className="font-bold text-white text-xl md:text-2xl lg:text-3xl text-center lg:text-left">
              Got Surplus Equipment? Start Selling Today.
            </h2>
            <button className="bg-[#1b1b1b] text-white px-8 py-3 rounded font-bold text-lg uppercase hover:bg-[#333] transition-colors">
              List Your Equipment
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1b1b1b] px-4 py-10 border-t border-neutral-800">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-[#f37121] text-xl font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <a href="#" className="block text-white hover:text-[#f37121] transition-colors">Browse</a>
              <a href="#" className="block text-white hover:text-[#f37121] transition-colors">Post</a>
              <a href="#" className="block text-white hover:text-[#f37121] transition-colors">Blog</a>
              <a href="#" className="block text-white hover:text-[#f37121] transition-colors">Terms</a>
            </div>
          </div>
          
          <div>
            <h3 className="text-[#f37121] text-xl font-bold mb-4">Contact</h3>
            <div className="space-y-2">
              <p className="text-white">info@highvoltage.com</p>
              <p className="text-white">(123) 456-7890</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-[#f37121] text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="text-white hover:text-[#f37121] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-white hover:text-[#f37121] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-white hover:text-[#f37121] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-[#f37121] text-lg font-bold mb-4">Newsletter</h3>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-neutral-800 text-white px-4 py-3 rounded placeholder:text-[#a1a1a1]"
              />
              <button className="w-full bg-[#f37121] text-neutral-900 py-2 rounded font-bold uppercase hover:bg-[#e55a0a] transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-center pt-8 border-t border-neutral-800">
          <p className="text-neutral-500 text-sm">
            © 2025 High Voltage Classifieds. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
