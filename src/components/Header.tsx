"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser, signOut } from "@/lib/auth";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error checking auth state:', error);
      // Don't treat this as a critical error - user might just not be logged in
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        setCurrentUser(null);
        setIsMobileMenuOpen(false);
        // Redirect to home page after sign out
        window.location.href = '/';
      } else {
        console.error('Sign out error:', result.error);
        alert('Failed to sign out. Please try again.');
      }
    } catch (error) {
      console.error('Sign out exception:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-[#1b1b1b] h-[95px] sticky top-0 z-50 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
      <div className="box-border content-stretch flex flex-col items-center justify-center pb-px pt-0 px-4 lg:px-20 relative size-full">
        <nav className="box-border content-stretch flex flex-row gap-4 lg:gap-[323px] items-center justify-between max-w-[1280px] px-0 py-4 relative shrink-0 w-full">
          <div className="box-border content-stretch flex flex-row gap-4 lg:gap-[38px] items-center justify-start p-0 relative shrink-0">
            {/* Logo */}
            <div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0">
              <Link href="/" className="flex items-center h-12 relative shrink-0" onClick={closeMobileMenu}>
                <Image
                  src="/assets/high-voltage-classifieds-logo.svg"
                  alt="High Voltage Classifieds"
                  width={180}
                  height={48}
                  className="h-12 w-auto object-contain"
                />
              </Link>
            </div>
            
            {/* Navigation Links - Hidden on mobile */}
            <div className="hidden lg:flex flex-row gap-6 items-center">
              <Link href="/listings" className="text-neutral-100 text-sm font-bold uppercase hover:text-[#f37121] transition-colors">
                Browse Listings
              </Link>
              <Link href="/blog" className="text-neutral-100 text-sm font-bold uppercase hover:text-[#f37121] transition-colors">
                Blog
              </Link>
              <Link href="/contact" className="text-neutral-100 text-sm font-bold uppercase hover:text-[#f37121] transition-colors">
                Contact
              </Link>
            </div>
          </div>
          
          {/* Right side navigation */}
          <div className="flex flex-row gap-4 items-center">
            {/* Dynamic Auth Link - Desktop */}
            {!loading && (
              <>
                {currentUser ? (
                  <div className="hidden lg:flex items-center gap-4">
                    <NotificationBell />
                    <span className="text-neutral-100 text-sm">
                      Hi, {currentUser.name || currentUser.email}
                    </span>
                    <button 
                      onClick={handleSignOut}
                      className="text-neutral-100 text-base font-bold hover:text-[#f37121] transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="hidden lg:flex items-center gap-4">
                    <Link href="/auth/signin" className="text-neutral-100 text-base font-bold hover:text-[#f37121] transition-colors">
                      Sign In
                    </Link>
                    <span className="text-neutral-100 text-base">|</span>
                    <Link href="/auth/signup" className="text-neutral-100 text-base font-bold hover:text-[#f37121] transition-colors">
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}
            
            {/* Dashboard Button - For all logged-in users */}
            {currentUser && (
              <Link 
                href="/dashboard" 
                onClick={closeMobileMenu}
                className="hidden lg:inline-block bg-[#f37121] text-white px-5 py-2 rounded shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] text-base font-bold uppercase hover:bg-[#e55a0a] transition-colors"
              >
                Dashboard
              </Link>
            )}
            
            {/* Post Listing Button - Only for non-logged-in users */}
            {!currentUser && !loading && (
              <Link 
                href="/auth/signup" 
                onClick={closeMobileMenu}
                className="hidden lg:inline-block bg-[#f37121] text-white px-5 py-2 rounded shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] text-base font-bold uppercase hover:bg-[#e55a0a] transition-colors"
              >
                Post Listing
              </Link>
            )}
            
            {/* Mobile menu button */}
            <button 
              className="lg:hidden text-white p-2 relative z-50 transition-colors hover:text-[#f37121]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <div className="w-6 h-6 relative">
                {/* Hamburger/Close Icon */}
                <span 
                  className={`absolute left-0 top-1 w-6 h-0.5 bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? 'rotate-45 top-2.5' : ''
                  }`}
                />
                <span 
                  className={`absolute left-0 top-2.5 w-6 h-0.5 bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span 
                  className={`absolute left-0 top-4 w-6 h-0.5 bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? '-rotate-45 top-2.5' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </nav>
      </div>
        
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}
        
      {/* Mobile Menu */}
      <div className={`lg:hidden fixed top-[95px] left-0 right-0 bg-[#1b1b1b] border-t border-neutral-800 z-40 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="px-4 py-6 max-h-[calc(100vh-95px)] overflow-y-auto">
          <div className="flex flex-col space-y-6">
            {/* Main Navigation */}
            <div className="space-y-4">
              <Link 
                href="/listings" 
                onClick={closeMobileMenu}
                className="block text-neutral-100 text-base font-bold uppercase hover:text-[#f37121] transition-colors py-2 border-b border-neutral-800"
              >
                Browse Listings
              </Link>
              <Link 
                href="/blog" 
                onClick={closeMobileMenu}
                className="block text-neutral-100 text-base font-bold uppercase hover:text-[#f37121] transition-colors py-2 border-b border-neutral-800"
              >
                Blog
              </Link>
              <Link 
                href="/contact" 
                onClick={closeMobileMenu}
                className="block text-neutral-100 text-base font-bold uppercase hover:text-[#f37121] transition-colors py-2 border-b border-neutral-800"
              >
                Contact
              </Link>
            </div>
              
            {/* User Section */}
            {!loading && (
              <div className="border-t border-neutral-700 pt-6">
                {currentUser ? (
                  <div className="space-y-4">
                    <div className="text-neutral-100 text-sm font-medium">
                      Hi, {currentUser.name || currentUser.email}
                    </div>
                    
                    {/* User Navigation Links */}
                    <div className="space-y-3">
                      <Link 
                        href="/messages" 
                        onClick={closeMobileMenu}
                        className="block text-neutral-100 text-base font-bold uppercase hover:text-[#f37121] transition-colors py-2"
                      >
                        Messages
                      </Link>
                      <Link 
                        href="/account" 
                        onClick={closeMobileMenu}
                        className="block text-neutral-100 text-base font-bold uppercase hover:text-[#f37121] transition-colors py-2"
                      >
                        Account
                      </Link>
                      <Link 
                        href="/favorites" 
                        onClick={closeMobileMenu}
                        className="block text-neutral-100 text-base font-bold uppercase hover:text-[#f37121] transition-colors py-2"
                      >
                        Favorites
                      </Link>
                      
                      {/* Dashboard link for all logged-in users */}
                      <Link 
                        href="/dashboard" 
                        onClick={closeMobileMenu}
                        className="block text-neutral-100 text-base font-bold uppercase hover:text-[#f37121] transition-colors py-2"
                      >
                        Dashboard
                      </Link>
                    </div>
                    
                    {/* Sign Out Button */}
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left text-red-400 text-base font-bold uppercase hover:text-red-300 transition-colors py-2 mt-4 border-t border-neutral-700 pt-4"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Link 
                      href="/auth/signin" 
                      onClick={closeMobileMenu}
                      className="block text-neutral-100 text-base font-bold uppercase hover:text-[#f37121] transition-colors py-2"
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      onClick={closeMobileMenu}
                      className="block bg-[#f37121] text-white text-center px-4 py-3 rounded font-bold uppercase hover:bg-[#e55a0a] transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 