import React from "react";

export default function HeroSection() {
  return (
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
  );
} 