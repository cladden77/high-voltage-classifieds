'use client'

import { useCallback, useEffect, useState } from 'react'

interface OverviewTotals {
  listings: number
  activeListings: number
  soldListings: number
  totalSales: number
  gmv: number
  listingFeeIncome: number
}

interface AdminUser {
  id: string
  email: string
  full_name?: string | null
  role: string
  can_sell: boolean
  seller_verified?: boolean
}

interface AdminListing {
  id: string
  title: string
  price: number
  status: string
  is_sold?: boolean
  category?: string
  location?: string
}

interface ListingFeeRow {
  id: string
  fee_amount: number
  status: string
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<OverviewTotals | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [listings, setListings] = useState<AdminListing[]>([])
  const [fees, setFees] = useState<ListingFeeRow[]>([])
  const [savingUserId, setSavingUserId] = useState<string | null>(null)
  const [savingListingId, setSavingListingId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string>('')
  const [userSearch, setUserSearch] = useState('')
  const [listingSearch, setListingSearch] = useState('')

  const loadData = useCallback(async () => {
    const userSearchParam = userSearch ? `?q=${encodeURIComponent(userSearch)}` : ''
    const listingSearchParam = listingSearch ? `?q=${encodeURIComponent(listingSearch)}` : ''
    const [overviewRes, usersRes, listingsRes, feesRes] = await Promise.all([
      fetch('/api/admin/overview'),
      fetch(`/api/admin/users${userSearchParam}`),
      fetch(`/api/admin/listings${listingSearchParam}`),
      fetch('/api/admin/revenue'),
    ])

    if (overviewRes.ok) {
      const json = await overviewRes.json()
      setOverview(json.totals)
    }
    if (usersRes.ok) {
      const json = await usersRes.json()
      setUsers(json.users || [])
    }
    if (listingsRes.ok) {
      const json = await listingsRes.json()
      setListings(json.listings || [])
    }
    if (feesRes.ok) {
      const json = await feesRes.json()
      setFees(json.listingFees || [])
    }
  }, [userSearch, listingSearch])

  useEffect(() => {
    loadData()
  }, [loadData])

  const updateUser = async (
    userId: string,
    payload: { role?: string; canSell?: boolean; sellerVerified?: boolean }
  ) => {
    try {
      setSavingUserId(userId)
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...payload }),
      })
      if (!response.ok) {
        throw new Error('Failed to update user')
      }
      setNotice('User updated successfully.')
      await loadData()
    } catch {
      setNotice('Failed to update user.')
    } finally {
      setSavingUserId(null)
    }
  }

  const updateListing = async (
    listingId: string,
    payload: { status?: string; isSold?: boolean }
  ) => {
    try {
      setSavingListingId(listingId)
      const response = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, ...payload }),
      })
      if (!response.ok) {
        throw new Error('Failed to update listing')
      }
      setNotice('Listing updated successfully.')
      await loadData()
    } catch {
      setNotice('Failed to update listing.')
    } finally {
      setSavingListingId(null)
    }
  }

  const removeUser = async (userId: string) => {
    const confirmed = window.confirm('Remove this user account? This action cannot be undone.')
    if (!confirmed) return

    try {
      setSavingUserId(userId)
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove user')
      }
      setNotice('User removed successfully.')
      await loadData()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove user.'
      setNotice(message)
    } finally {
      setSavingUserId(null)
    }
  }

  const removeListing = async (listingId: string) => {
    const confirmed = window.confirm('Remove this listing? This action cannot be undone.')
    if (!confirmed) return

    try {
      setSavingListingId(listingId)
      const response = await fetch('/api/admin/listings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })
      if (!response.ok) {
        throw new Error('Failed to remove listing')
      }
      setNotice('Listing removed successfully.')
      await loadData()
    } catch {
      setNotice('Failed to remove listing.')
    } finally {
      setSavingListingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {notice && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {notice}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="font-open-sans text-sm text-gray-500">Total Listings</p>
          <p className="font-open-sans text-2xl font-bold text-gray-900">{overview?.listings ?? '-'}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="font-open-sans text-sm text-gray-500">Active Listings</p>
          <p className="font-open-sans text-2xl font-bold text-gray-900">{overview?.activeListings ?? '-'}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="font-open-sans text-sm text-gray-500">Sold Listings</p>
          <p className="font-open-sans text-2xl font-bold text-gray-900">{overview?.soldListings ?? '-'}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="font-open-sans text-sm text-gray-500">Total Sales</p>
          <p className="font-open-sans text-2xl font-bold text-gray-900">{overview?.totalSales ?? '-'}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="font-open-sans text-sm text-gray-500">Gross Merchandise Value</p>
          <p className="font-open-sans text-2xl font-bold text-gray-900">${overview?.gmv?.toLocaleString() ?? '-'}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="font-open-sans text-sm text-gray-500">Listing Fee Income</p>
          <p className="font-open-sans text-2xl font-bold text-gray-900">${overview?.listingFeeIncome?.toLocaleString() ?? '-'}</p>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="font-open-sans text-xl font-bold text-gray-900 mb-6">Account Management</h2>
        <div className="mb-4">
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-open-sans text-sm"
          />
        </div>
        <div className="space-y-3 max-h-96 overflow-auto">
          {users.map((user) => (
            <div key={user.id} className="border border-gray-200 rounded-lg p-4">
              <div className="font-open-sans font-bold text-gray-900">{user.full_name || user.email}</div>
              <div className="font-open-sans text-sm text-gray-500 mb-3">{user.email}</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-open-sans text-xs font-bold text-gray-500 uppercase mb-1">
                    Role
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white font-open-sans text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={user.role}
                    disabled={savingUserId === user.id}
                    onChange={(e) => updateUser(user.id, { role: e.target.value })}
                  >
                    <option value="buyer">buyer</option>
                    <option value="seller">seller</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-open-sans text-xs font-bold text-gray-500 uppercase mb-1">
                    Can Sell
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white font-open-sans text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={String(user.can_sell)}
                    disabled={savingUserId === user.id}
                    onChange={(e) => updateUser(user.id, { canSell: e.target.value === 'true' })}
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <div>
                  <label className="block font-open-sans text-xs font-bold text-gray-500 uppercase mb-1">
                    Seller Verified
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white font-open-sans text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={String(!!user.seller_verified)}
                    disabled={savingUserId === user.id}
                    onChange={(e) => updateUser(user.id, { sellerVerified: e.target.value === 'true' })}
                  >
                    <option value="true">Verified</option>
                    <option value="false">Not Verified</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  className="px-3 py-2 rounded-lg font-open-sans text-sm font-bold bg-red-100 text-red-700 hover:bg-red-200"
                  disabled={savingUserId === user.id}
                  onClick={() => removeUser(user.id)}
                >
                  Remove User
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="font-open-sans text-xl font-bold text-gray-900 mb-6">Listings Management</h2>
        <div className="mb-4">
          <input
            type="text"
            value={listingSearch}
            onChange={(e) => setListingSearch(e.target.value)}
            placeholder="Search listings by title, category, or location..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-open-sans text-sm"
          />
        </div>
        <div className="space-y-3 max-h-96 overflow-auto">
          {listings.map((listing) => (
            <div key={listing.id} className="border border-gray-200 rounded-lg p-4">
              <div className="font-open-sans font-bold text-gray-900">{listing.title}</div>
              <div className="font-open-sans text-sm text-gray-500 mb-3">
                ${Number(listing.price).toLocaleString()} - {listing.category} - {listing.location}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-open-sans text-xs font-bold text-gray-500 uppercase mb-1">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white font-open-sans text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={listing.status}
                    disabled={savingListingId === listing.id}
                    onChange={(e) => updateListing(listing.id, { status: e.target.value })}
                  >
                    <option value="draft">draft</option>
                    <option value="active">active</option>
                    <option value="sold">sold</option>
                    <option value="archived">archived</option>
                  </select>
                </div>
                <div>
                  <label className="block font-open-sans text-xs font-bold text-gray-500 uppercase mb-1">
                    Sold Flag
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white font-open-sans text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={String(!!listing.is_sold)}
                    disabled={savingListingId === listing.id}
                    onChange={(e) => updateListing(listing.id, { isSold: e.target.value === 'true' })}
                  >
                    <option value="true">Sold</option>
                    <option value="false">Available</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  className="px-3 py-2 rounded-lg font-open-sans text-sm font-bold bg-red-100 text-red-700 hover:bg-red-200"
                  disabled={savingListingId === listing.id}
                  onClick={() => removeListing(listing.id)}
                >
                  Remove Listing
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="font-open-sans text-xl font-bold text-gray-900 mb-6">Listing Fee Revenue</h2>
        <div className="space-y-3 max-h-96 overflow-auto">
          {fees.map((fee) => (
            <div key={fee.id} className="border border-gray-200 rounded-lg p-4">
              <p className="font-open-sans text-sm text-gray-500">Fee Transaction</p>
              <p className="font-open-sans text-lg font-bold text-gray-900">
                ${Number(fee.fee_amount).toFixed(2)}
              </p>
              <p className="font-open-sans text-sm text-gray-600">Status: {fee.status}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
