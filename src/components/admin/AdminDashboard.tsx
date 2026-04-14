'use client'

import { useEffect, useState } from 'react'

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
  role: string
  can_sell: boolean
}

interface AdminListing {
  id: string
  title: string
  price: number
  status: string
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

  const loadData = async () => {
    const [overviewRes, usersRes, listingsRes, feesRes] = await Promise.all([
      fetch('/api/admin/overview'),
      fetch('/api/admin/users'),
      fetch('/api/admin/listings'),
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
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">Total Listings: {overview?.listings ?? '-'}</div>
        <div className="border rounded-lg p-4">Active Listings: {overview?.activeListings ?? '-'}</div>
        <div className="border rounded-lg p-4">Sold Listings: {overview?.soldListings ?? '-'}</div>
        <div className="border rounded-lg p-4">Total Sales: {overview?.totalSales ?? '-'}</div>
        <div className="border rounded-lg p-4">GMV: ${overview?.gmv?.toLocaleString() ?? '-'}</div>
        <div className="border rounded-lg p-4">Fee Income: ${overview?.listingFeeIncome?.toLocaleString() ?? '-'}</div>
      </section>

      <section className="border rounded-lg p-4">
        <h2 className="font-bold mb-3">Account Management</h2>
        <div className="space-y-2 max-h-80 overflow-auto">
          {users.map((user) => (
            <div key={user.id} className="text-sm border-b pb-2">
              {user.email} - {user.role} - seller enabled: {String(user.can_sell)}
            </div>
          ))}
        </div>
      </section>

      <section className="border rounded-lg p-4">
        <h2 className="font-bold mb-3">Listings Management</h2>
        <div className="space-y-2 max-h-80 overflow-auto">
          {listings.map((listing) => (
            <div key={listing.id} className="text-sm border-b pb-2">
              {listing.title} - ${Number(listing.price).toLocaleString()} - {listing.status}
            </div>
          ))}
        </div>
      </section>

      <section className="border rounded-lg p-4">
        <h2 className="font-bold mb-3">Listing Fee Revenue</h2>
        <div className="space-y-2 max-h-80 overflow-auto">
          {fees.map((fee) => (
            <div key={fee.id} className="text-sm border-b pb-2">
              Fee ${Number(fee.fee_amount).toFixed(2)} - status: {fee.status}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
