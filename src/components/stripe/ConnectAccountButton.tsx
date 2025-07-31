'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/auth'
import { toast } from '@/components/ui/use-toast'

interface ConnectAccountButtonProps {
  className?: string
  children?: React.ReactNode
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

interface AccountData {
  hasStripeAccount: boolean
  stripeAccountId?: string
  isComplete: boolean
  onboardingUrl?: string
  charges_enabled?: boolean
  payouts_enabled?: boolean
}

export default function ConnectAccountButton({ 
  className, 
  children, 
  onSuccess, 
  onError 
}: ConnectAccountButtonProps) {
  const [loading, setLoading] = useState(false)
  const [accountData, setAccountData] = useState<AccountData | null>(null)

  const handleConnectAccount = async () => {
    try {
      setLoading(true)

      // Check if user is authenticated
      const user = await getCurrentUser()
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to connect your Stripe account.",
          variant: "destructive",
        })
        return
      }

      if (user.role !== 'seller') {
        toast({
          title: "Sellers Only",
          description: "Only sellers can connect Stripe accounts.",
          variant: "destructive",
        })
        return
      }

      // First, check current account status
      const statusResponse = await fetch('/api/create-stripe-account', {
        method: 'GET',
      })

      if (!statusResponse.ok) {
        throw new Error('Failed to check account status')
      }

      const statusData = await statusResponse.json()
      
      if (statusData.success && statusData.data.hasStripeAccount && statusData.data.isComplete) {
        toast({
          title: "Account Already Connected",
          description: "Your Stripe account is already set up and ready to receive payments.",
        })
        setAccountData(statusData.data)
        onSuccess?.(statusData.data)
        return
      }

      // Create or get onboarding URL
      const response = await fetch('/api/create-stripe-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create Stripe account')
      }

      const data = await response.json()

      if (data.success) {
        // Redirect to Stripe onboarding
        window.location.href = data.data.onboardingUrl
        onSuccess?.(data.data)
      } else {
        throw new Error(data.error || 'Failed to create Stripe account')
      }
    } catch (error) {
      console.error('Error connecting Stripe account:', error)
      const message = error instanceof Error ? error.message : 'Failed to connect Stripe account'
      
      toast({
        title: "Connection Failed",
        description: message,
        variant: "destructive",
      })
      
      onError?.(message)
    } finally {
      setLoading(false)
    }
  }

  const getButtonText = () => {
    if (loading) return 'Connecting...'
    if (accountData?.isComplete) return 'Account Connected ✓'
    if (accountData?.hasStripeAccount) return 'Complete Setup'
    return children || 'Connect Stripe Account'
  }

  const isDisabled = loading || (accountData?.isComplete === true)

  return (
    <Button
      onClick={handleConnectAccount}
      disabled={isDisabled}
      className={className}
      variant={accountData?.isComplete ? "outline" : "default"}
    >
      {getButtonText()}
    </Button>
  )
}

// Hook to check Stripe account status
export function useStripeAccountStatus() {
  const [accountData, setAccountData] = useState<AccountData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/create-stripe-account', {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to check account status')
      }

      const data = await response.json()
      
      if (data.success) {
        setAccountData(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch account status')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return {
    accountData,
    loading,
    error,
    checkStatus,
    refetch: checkStatus,
  }
}