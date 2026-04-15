import React from "react";
import Link from "next/link";
import NewsletterSubscribeForm from "@/components/NewsletterSubscribeForm";

export default function Footer() {
  return (
    <footer className="bg-[#1b1b1b] px-4 py-10 border-t border-neutral-800">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        <div>
          <h3 className="text-[#f37121] text-xl font-bold mb-4">Quick Links</h3>
          <div className="space-y-2">
            <Link href="/listings" className="block text-white hover:text-[#f37121] transition-colors">Browse Listings</Link>
            <Link href="/dashboard" className="block text-white hover:text-[#f37121] transition-colors">Post Listing</Link>
            <Link href="/blog" className="block text-white hover:text-[#f37121] transition-colors">Blog</Link>
            <Link href="/contact" className="block text-white hover:text-[#f37121] transition-colors">Contact</Link>
            <Link href="/terms" className="block text-white hover:text-[#f37121] transition-colors">Terms</Link>
            <Link href="/privacy" className="block text-white hover:text-[#f37121] transition-colors">Privacy</Link>
          </div>
        </div>
        
        <div>
          <h3 className="text-[#f37121] text-xl font-bold mb-4">Contact Info</h3>
          <div className="space-y-2">
            <p className="text-white">support@highvoltageclassifieds.com</p>
            <p className="text-white">(555) 123-4567</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-[#f37121] text-xl font-bold mb-4">Follow Us</h3>
          <div className="flex gap-4">
            {/* <a href="#" className="text-white hover:text-[#f37121] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
              </svg>
            </a> */}
            <a href="https://www.instagram.com/highvoltageclassifieds/" className="text-white hover:text-[#f37121] transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/113404548" className="text-white hover:text-[#f37121] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
        
        <div>
          <h3 className="text-[#f37121] text-lg font-bold mb-3">Newsletter</h3>
          <NewsletterSubscribeForm />
        </div>
      </div>
      
      <div className="text-center pt-8 border-t border-neutral-800">
        <p className="text-neutral-500 text-sm">
          © 2026 High Voltage Classifieds. All rights reserved.
        </p>
      </div>
    </footer>
  );
} 