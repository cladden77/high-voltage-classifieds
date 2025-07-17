import React from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedListings from "@/components/FeaturedListings";
import HowItWorks from "@/components/HowItWorks";
import TrustSection from "@/components/TrustSection";
import BlogSection from "@/components/BlogSection";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div
      className="bg-[#ffffff] relative min-h-screen"
      data-name="Home Page Option 1 - 1440w"
    >
      <Header />
      <main>
        <HeroSection />
        <FeaturedListings />
        <HowItWorks />
        <TrustSection />
        <BlogSection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
