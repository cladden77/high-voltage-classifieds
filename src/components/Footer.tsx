import React from "react";
import Link from "next/link";

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
  );
} 