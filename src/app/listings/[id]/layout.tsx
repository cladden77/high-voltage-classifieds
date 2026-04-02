import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

type MetadataProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { id } = await params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const canonical = `${baseUrl.replace(/\/$/, '')}/listings/${id}`

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return { title: 'Listing | High Voltage Classifieds' }
  }

  const supabase = createClient<Database>(url, key)
  const { data } = await supabase
    .from('listings')
    .select('title, description, image_urls')
    .eq('id', id)
    .single()

  if (!data) {
    return {
      title: 'Listing not found | High Voltage Classifieds',
      robots: { index: false },
    }
  }

  const pageTitle = `${data.title} | High Voltage Classifieds`
  const description =
    data.description?.trim().slice(0, 160) ||
    `View ${data.title} on High Voltage Classifieds.`
  const ogImage = data.image_urls?.[0]

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: data.title,
      description,
      url: canonical,
      siteName: 'High Voltage Classifieds',
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage, alt: data.title }] } : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: data.title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}

export default function ListingDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
