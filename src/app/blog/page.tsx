'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, User, ArrowRight } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// This would typically come from Sanity CMS
type BlogPost = {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  publishedDate: string
  category: string
  image?: string
  slug: string
}

// Sample blog posts - replace with Sanity CMS data
const samplePosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of High Voltage Equipment in Solar Energy',
    excerpt: 'Explore how the solar industry is driving innovation in high voltage equipment design and manufacturing.',
    content: '',
    author: 'Sarah Johnson',
    publishedDate: '2024-01-15',
    category: 'Solar Energy',
    slug: 'future-high-voltage-solar-energy'
  },
  {
    id: '2',
    title: 'Safety Best Practices for Used Electrical Equipment',
    excerpt: 'Essential safety guidelines when purchasing and installing pre-owned high voltage equipment.',
    content: '',
    author: 'Michael Chen',
    publishedDate: '2024-01-10',
    category: 'Safety',
    slug: 'safety-best-practices-used-equipment'
  },
  {
    id: '3',
    title: 'How to Evaluate Transformer Condition Before Purchase',
    excerpt: 'A comprehensive guide to assessing transformer health and determining fair market value.',
    content: '',
    author: 'David Rodriguez',
    publishedDate: '2024-01-05',
    category: 'Equipment Guide',
    slug: 'evaluate-transformer-condition'
  },
  {
    id: '4',
    title: 'Market Trends: Used Equipment Demand in 2024',
    excerpt: 'Analysis of current market conditions and predictions for the used high voltage equipment sector.',
    content: '',
    author: 'Lisa Thompson',
    publishedDate: '2024-01-01',
    category: 'Market Analysis',
    slug: 'market-trends-2024'
  }
]

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All Categories')

  useEffect(() => {
    // TODO: Replace with actual Sanity CMS data fetching
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      // TODO: Implement Sanity CMS client
      // const client = createSanityClient()
      // const posts = await client.fetch('*[_type == "post"]')
      
      // For now, use sample data
      setTimeout(() => {
        setPosts(samplePosts)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      setLoading(false)
    }
  }

  const categories = ['All Categories', ...new Set(posts.map(post => post.category))]
  
  const filteredPosts = selectedCategory === 'All Categories' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

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

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-open-sans text-sm font-bold transition-colors ${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {filteredPosts.length > 0 && (
          <div className="mb-12">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="h-64 md:h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 font-open-sans">Featured Image</span>
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="mb-4">
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-open-sans font-bold">
                      Featured
                    </span>
                  </div>
                  <h2 className="font-staatliches text-3xl text-gray-900 mb-4">
                    {filteredPosts[0].title}
                  </h2>
                  <p className="font-open-sans text-gray-600 mb-4 leading-relaxed">
                    {filteredPosts[0].excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span className="font-open-sans">{filteredPosts[0].author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className="font-open-sans">
                        {new Date(filteredPosts[0].publishedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`/blog/${filteredPosts[0].slug}`}
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-open-sans font-bold"
                  >
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.slice(1).map((post) => (
            <article key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-open-sans">Blog Image</span>
              </div>
              
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
                <a
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-600 font-open-sans font-bold text-sm"
                >
                  Read More
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Load More */}
        {filteredPosts.length > 6 && (
          <div className="text-center mt-12">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-8 rounded-lg font-open-sans font-bold">
              Load More Articles
            </button>
          </div>
        )}

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