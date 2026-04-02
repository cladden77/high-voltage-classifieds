'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Share2, Link2, Check } from 'lucide-react'

type ListingShareButtonProps = {
  listingId: string
  title: string
  price: number
  imageUrl?: string | null
}

function buildShareText(title: string, price: number) {
  return `${title} — $${price.toLocaleString()}`
}

export default function ListingShareButton({
  listingId,
  title,
  price,
  imageUrl,
}: ListingShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [listingUrl, setListingUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setListingUrl(`${window.location.origin}/listings/${listingId}`)
  }, [listingId])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const shareNative = useCallback(async () => {
    if (!listingUrl || typeof navigator.share !== 'function') return
    const text = buildShareText(title, price)
    const base: ShareData = { title, text, url: listingUrl }

    if (imageUrl && typeof navigator.canShare === 'function') {
      try {
        const res = await fetch(imageUrl)
        const blob = await res.blob()
        const ext = blob.type?.split('/')[1] || 'jpg'
        const file = new File([blob], `listing.${ext}`, { type: blob.type || 'image/jpeg' })
        const withFiles = { ...base, files: [file] }
        if (navigator.canShare(withFiles)) {
          await navigator.share(withFiles)
          setOpen(false)
          return
        }
      } catch {
        /* fall through to URL-only share */
      }
    }

    await navigator.share(base)
    setOpen(false)
  }, [imageUrl, listingUrl, price, title])

  const copyLink = useCallback(async () => {
    if (!listingUrl) return
    try {
      await navigator.clipboard.writeText(listingUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', listingUrl)
    }
  }, [listingUrl])

  const encodedUrl = encodeURIComponent(listingUrl)
  const encodedTitle = encodeURIComponent(title)
  const encodedText = encodeURIComponent(buildShareText(title, price))

  const socialLinks = listingUrl
    ? [
        {
          label: 'Facebook',
          href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        },
        {
          label: 'X',
          href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
        },
        {
          label: 'LinkedIn',
          href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        },
        ...(imageUrl
          ? [
              {
                label: 'Pinterest',
                href: `https://www.pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(imageUrl)}&description=${encodedTitle}`,
              },
            ]
          : []),
        {
          label: 'Email',
          href: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${buildShareText(title, price)}\n\n${listingUrl}`)}`,
        },
      ]
    : []

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
        aria-expanded={open}
        aria-haspopup="menu"
        title="Share listing"
      >
        <Share2 className="h-6 w-6" aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button
              type="button"
              role="menuitem"
              onClick={() => void shareNative()}
              className="w-full px-4 py-2.5 text-left font-open-sans text-sm text-gray-900 hover:bg-gray-50"
            >
              Share…
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => void copyLink()}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-open-sans text-sm text-gray-900 hover:bg-gray-50"
          >
            {copied ? (
              <Check className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
            ) : (
              <Link2 className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
            )}
            {copied ? 'Link copied' : 'Copy link'}
          </button>
          {socialLinks.map(({ label, href }) => (
            <a
              key={label}
              role="menuitem"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2.5 font-open-sans text-sm text-gray-900 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              Share on {label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
