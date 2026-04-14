import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { getCurrentUserRole } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const { user, role } = await getCurrentUserRole()
  if (!user) {
    redirect('/auth/signin')
  }
  if (role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-8 py-8">
        <h1 className="font-staatliches text-[54px] leading-[48px] tracking-[-1.2px] text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="font-open-sans text-lg text-gray-500 mb-8">
          Manage accounts, listings, and platform performance.
        </p>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <AdminDashboard />
        </div>
      </main>
      <Footer />
    </div>
  )
}
