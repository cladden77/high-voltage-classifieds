import React from 'react'
import { Calendar, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAllPosts, SanityPost } from '@/lib/sanity'
import { urlFor } from '@/lib/sanity'

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

export default async function BlogPage() {
  // Fetch posts from Sanity
  const sanityPosts = await getAllPosts()
  const posts = sanityPosts.map(convertSanityPost)
  
  const categories = ['All Categories', ...new Set(posts.map(post => post.category))]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-staatliches text-[54px] leading-[48px] tracking-[-1.2px] text-gray-900 mb-2">
            Industry Blog
          </h1>
          <p className="font-open-sans text-lg text-gray-500">
            Insights, trends, and expert advice for the high voltage equipment industry
          </p>
        </div>

        {/* Featured Post */}
        {posts.length > 0 && (
          <div className="mb-12">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="md:flex">
                <div className="md:w-1/2">
                  {posts[0].image ? (
                    <img 
                      src={posts[0].image} 
                      alt={posts[0].title}
                      className="h-64 md:h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-64 md:h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 font-open-sans">Featured Image</span>
                    </div>
                  )}
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="mb-4">
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-open-sans font-bold">
                      Featured
                    </span>
                  </div>
                  <h2 className="font-staatliches text-3xl text-gray-900 mb-4">
                    {posts[0].title}
                  </h2>
                  <p className="font-open-sans text-gray-600 mb-4 leading-relaxed">
                    {posts[0].excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span className="font-open-sans">{posts[0].author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className="font-open-sans">
                        {new Date(posts[0].publishedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/blog/${posts[0].slug}`}
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-open-sans font-bold"
                  >
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(1).map((post) => (
            <article key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Image */}
              {post.image ? (
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-open-sans">Blog Image</span>
                </div>
              )}
              
              {/* Content */}
              <div className="p-6">
                {/* Category */}
                <div className="mb-3">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-open-sans font-bold">
                    {post.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-open-sans font-bold text-lg text-gray-900 mb-3 leading-7">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="font-open-sans text-gray-600 mb-4 leading-6">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span className="font-open-sans">{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span className="font-open-sans">
                      {new Date(post.publishedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Read More */}
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-600 font-open-sans font-bold text-sm"
                >
                  Read More
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>

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