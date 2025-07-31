'use client'

import React, { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";

export default function CallToAction() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error checking auth:', error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (!currentUser) {
      // Not logged in - redirect to sign in
      window.location.href = '/auth/signin';
    } else if (currentUser.role === 'seller') {
      // Logged in as seller - redirect to create listing
      window.location.href = '/dashboard/create-listing';
    } else {
      // Logged in as buyer - redirect to sign in (to change account type)
      window.location.href = '/auth/signin';
    }
  };

  const getButtonText = () => {
    if (loading) {
      return 'Loading...';
    }
    if (!currentUser) {
      return 'List Your Equipment';
    }
    if (currentUser.role === 'seller') {
      return 'Create New Listing';
    }
    return 'List Your Equipment';
  };

  return (
    <section className="bg-[#f37121] px-4 lg:px-52 py-10">
      <div className="max-w-[1024px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
        <h2 className="font-bold text-white text-2xl md:text-3xl text-center lg:text-left">
          Got Surplus Equipment? Start Selling Today.
        </h2>
        <button 
          onClick={handleButtonClick}
          disabled={loading}
          className="bg-[#1b1b1b] text-white px-8 py-3 rounded font-bold text-lg uppercase hover:bg-[#333] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {getButtonText()}
        </button>
      </div>
    </section>
  );
} 