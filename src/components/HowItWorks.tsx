import React from "react";

export default function HowItWorks() {
  return (
    <section className="bg-white px-4 lg:px-20 py-16">
      <div className="max-w-[1280px] mx-auto">
        <h2 className="font-staatliches text-gray-900 text-4xl md:text-5xl text-center tracking-[-1.2px] leading-tight mb-10">
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
  );
} 