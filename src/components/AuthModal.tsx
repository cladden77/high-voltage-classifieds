import React from 'react'
import Link from 'next/link'
import { X, User, UserPlus } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  action: string // e.g., "send messages", "make purchases", "save favorites"
}

export default function AuthModal({ isOpen, onClose, action }: AuthModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Content */}
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="font-open-sans text-xl font-bold text-gray-900 mb-2">
              Sign In Required
            </h3>
            <p className="font-open-sans text-gray-600 mb-6">
              You need to be signed in to {action}. Join our community to access all features!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-open-sans font-bold transition-colors flex items-center justify-center gap-2"
            >
              <User className="h-4 w-4" />
              Sign In
            </Link>
            
            <Link
              href="/auth/signup"
              className="w-full bg-white hover:bg-gray-50 text-orange-500 border-2 border-orange-500 py-3 px-6 rounded-lg font-open-sans font-bold transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Create Account
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="font-open-sans text-sm text-gray-500">
              Creating an account is free and takes less than a minute
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 