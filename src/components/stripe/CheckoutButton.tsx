'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/auth'
import { toast } from '@/components/ui/use-toast'

import { formatPrice } from '@/lib/format'

interface CheckoutButtonProps {
  listingId: string
  listingTitle: string
  price: number
  className?: string
  children?: React.ReactNode
  successUrl?: string
  cancelUrl?: string
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  disabled?: boolean
}

export default function CheckoutButton({
  listingId,
  listingTitle,
  price,
  className,
  children,
  successUrl,
  cancelUrl,
  onSuccess,
  onError,
  disabled = false,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    try {
      setLoading(true)

      // Check if user is authenticated
      const user = await getCurrentUser()
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to purchase this item.",
          variant: "destructive",
        })
        return
      }

      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          successUrl,
          cancelUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const data = await response.json()

      if (data.success && data.data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.data.url
        onSuccess?.(data.data)
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      const message = error instanceof Error ? error.message : 'Failed to start checkout'
      
      toast({
        title: "Checkout Failed",
        description: message,
        variant: "destructive",
      })
      
      onError?.(message)
    } finally {
      setLoading(false)
    }
  }

  const buttonText = loading 
    ? 'Redirecting to checkout...' 
    : children || `Buy Now - ${formatPrice(price)}`

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || loading}
      className={className}
      size="lg"
    >
      {buttonText}
    </Button>
  )
}

// Compact version for use in listing cards
interface QuickCheckoutButtonProps {
  listingId: string
  price: number
  className?: string
  size?: 'sm' | 'default' | 'lg'
}

export function QuickCheckoutButton({ 
  listingId, 
  price, 
  className, 
  size = 'sm' 
}: QuickCheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleQuickCheckout = async () => {
    try {
      setLoading(true)

      const user = await getCurrentUser()
      if (!user) {
        toast({
          title: "Sign In Required",
          description: "Please sign in to purchase this item.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Checkout failed')
      }

      const data = await response.json()

      if (data.success && data.data.url) {
        window.location.href = data.data.url
      } else {
        throw new Error('Failed to start checkout')
      }
    } catch (error) {
      console.error('Quick checkout error:', error)
      const message = error instanceof Error ? error.message : 'Checkout failed'
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleQuickCheckout}
      disabled={loading}
      className={className}
      size={size}
      variant="outline"
    >
      {loading ? 'Loading...' : formatPrice(price)}
    </Button>
  )
}