'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Clock, CreditCard } from 'lucide-react'
import ConnectAccountButton from './ConnectAccountButton'

interface AccountStatus {
  hasStripeAccount: boolean
  stripeAccountId?: string
  isComplete: boolean
  charges_enabled?: boolean
  payouts_enabled?: boolean
  requirements?: {
    currently_due?: string[]
    eventually_due?: string[]
    past_due?: string[]
    disabled_reason?: string
  }
}

interface StripeAccountStatusProps {
  className?: string
  showDetails?: boolean
}

export default function StripeAccountStatus({ 
  className, 
  showDetails = true 
}: StripeAccountStatusProps) {
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccountStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/create-stripe-account', {
        method: 'GET',
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please sign in to view account status')
          return
        }
        throw new Error('Failed to fetch account status')
      }

      const data = await response.json()
      
      if (data.success) {
        setAccountStatus(data.data)
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

  useEffect(() => {
    fetchAccountStatus()
  }, [])

  const getStatusBadge = () => {
    if (!accountStatus?.hasStripeAccount) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Not Connected
        </Badge>
      )
    }

    if (accountStatus.isComplete) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>
      )
    }

    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Pending Setup
      </Badge>
    )
  }

  const getCapabilitiesStatus = () => {
    if (!accountStatus?.hasStripeAccount || !accountStatus.isComplete) {
      return null
    }

    return (
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1">
          <CreditCard className="h-4 w-4" />
          <span>Charges: </span>
          <Badge variant={accountStatus.charges_enabled ? "default" : "secondary"}>
            {accountStatus.charges_enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <CreditCard className="h-4 w-4" />
          <span>Payouts: </span>
          <Badge variant={accountStatus.payouts_enabled ? "default" : "secondary"}>
            {accountStatus.payouts_enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Payment Account</CardTitle>
            <CardDescription>
              Connect your Stripe account to receive payments
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        {!accountStatus?.hasStripeAccount ? (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need to connect a Stripe account to start receiving payments for your listings.
              </AlertDescription>
            </Alert>
            <ConnectAccountButton 
              onSuccess={() => fetchAccountStatus()}
              className="w-full"
            />
          </div>
        ) : !accountStatus.isComplete ? (
          <div className="space-y-4">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Your Stripe account setup is incomplete. Complete the setup to start receiving payments.
              </AlertDescription>
            </Alert>
            <ConnectAccountButton 
              onSuccess={() => fetchAccountStatus()}
              className="w-full"
            >
              Complete Setup
            </ConnectAccountButton>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your Stripe account is connected and ready to receive payments!
              </AlertDescription>
            </Alert>
            
            {showDetails && getCapabilitiesStatus()}
            
            {accountStatus.requirements?.currently_due && 
             accountStatus.requirements.currently_due.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Action required: {accountStatus.requirements.currently_due.length} item(s) need attention.
                </AlertDescription>
              </Alert>
            )}

            <Button 
              variant="outline" 
              onClick={() => fetchAccountStatus()}
              className="w-full"
            >
              Refresh Status
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact component for dashboard
export function StripeAccountStatusBadge({ className }: { className?: string }) {
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/create-stripe-account', {
          method: 'GET',
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setAccountStatus(data.data)
          }
        }
      } catch (error) {
        console.error('Error fetching account status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

  if (loading || !accountStatus) return null

  if (!accountStatus.hasStripeAccount) {
    return (
      <Badge variant="secondary" className={className}>
        Payment setup required
      </Badge>
    )
  }

  if (!accountStatus.isComplete) {
    return (
      <Badge variant="destructive" className={className}>
        Complete payment setup
      </Badge>
    )
  }

  return (
    <Badge variant="default" className={className}>
      Payment ready
    </Badge>
  )
}