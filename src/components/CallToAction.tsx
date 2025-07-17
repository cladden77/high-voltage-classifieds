import React from "react";

export default function CallToAction() {
  return (
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
  );
} 