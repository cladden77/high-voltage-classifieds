import React from 'react'
import { Calendar, User, ArrowLeft } from 'lucide-react'
import { PortableText } from '@portabletext/react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getPostBySlug, getAllPostSlugs, SanityPost } from '@/lib/sanity'
import { urlFor } from '@/lib/sanity'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Convert Sanity post to our blog post format
function convertSanityPost(post: SanityPost) {
  return {
    id: post._id,
    title: post.title,
    excerpt: post.excerpt,
    content: post.body,
    author: post.author?.name || 'Anonymous',
    publishedDate: post.publishedAt,
    category: post.category || 'Uncategorized',
    image: post.mainImage ? urlFor(post.mainImage).url() : null,
    slug: post.slug.current
  }
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs()
  return slugs.map((slug) => ({
    slug: slug,
  }))
}

// PortableText components for custom rendering
const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      return (
        <div className="my-8">
          <img
            src={urlFor(value).url()}
            alt={value.alt || 'Blog image'}
            className="w-full h-auto rounded-lg"
          />
          {value.caption && (
            <p className="text-sm text-gray-500 mt-2 text-center">{value.caption}</p>
          )}
        </div>
      )
    },
  },
  block: {
    h1: ({ children }: any) => (
      <h1 className="font-staatliches text-3xl text-gray-900 mb-6 mt-8">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="font-open-sans font-bold text-2xl text-gray-900 mb-4 mt-6">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="font-open-sans font-bold text-xl text-gray-900 mb-3 mt-5">{children}</h3>
    ),
    normal: ({ children }: any) => (
      <p className="font-open-sans text-gray-700 mb-4 leading-relaxed">{children}</p>
    ),
  },
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  
  if (!post) {
    notFound()
  }

  const convertedPost = convertSanityPost(post)

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Back to Blog */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-open-sans font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <article>
          {/* Category */}
          <div className="mb-4">
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-open-sans font-bold">
              {convertedPost.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-staatliches text-4xl md:text-5xl text-gray-900 mb-6 leading-tight">
            {convertedPost.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-6 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-open-sans">{convertedPost.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-open-sans">
                {new Date(convertedPost.publishedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Featured Image */}
          {convertedPost.image && (
            <div className="mb-8">
              <img
                src={convertedPost.image}
                alt={convertedPost.title}
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}

          {/* Excerpt */}
          {convertedPost.excerpt && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <p className="font-open-sans text-lg text-gray-700 italic">
                {convertedPost.excerpt}
              </p>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <PortableText
              value={convertedPost.content}
              components={portableTextComponents}
            />
          </div>
        </article>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-orange-50 rounded-lg p-8 text-center">
          <h3 className="font-staatliches text-2xl text-gray-900 mb-2">
            Stay Updated
          </h3>
          <p className="font-open-sans text-gray-600 mb-6">
            Get the latest industry insights and equipment listings delivered to your inbox
          </p>
          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-lg font-open-sans font-bold">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
} 