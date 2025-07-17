import React from "react";

export default function TrustSection() {
  return (
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
  );
} 