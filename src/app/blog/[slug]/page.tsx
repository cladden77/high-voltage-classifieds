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

// Fallback hardcoded posts for when Sanity is not available
const fallbackPosts = [
  {
    id: 1,
    title: "How to Inspect Surplus Transformers",
    excerpt: "A step-by-step guide for contractors and buyers to safely evaluate used high-voltage transformers.",
    content: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: "When purchasing surplus transformers, proper inspection is crucial to ensure you're getting quality equipment that will perform reliably in your application. This comprehensive guide covers the essential steps every contractor and buyer should follow."
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: "Visual Inspection"
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: "Start with a thorough visual examination. Look for signs of damage, corrosion, or wear. Check the nameplate for specifications and ensure it matches your requirements."
          }
        ]
      }
    ],
    author: "Industry Expert",
    publishedDate: "2024-01-15",
    category: "Equipment Guide",
    image: null,
    slug: "how-to-inspect-surplus-transformers"
  },
  {
    id: 2,
    title: "Top 5 Safety Tips for High Voltage Work",
    excerpt: "Essential safety practices for working with and around high-voltage equipment in the field.",
    content: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: "Working with high-voltage equipment requires strict adherence to safety protocols. These five essential tips can help prevent accidents and ensure safe operations."
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: "1. Always Use Proper PPE"
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: "Personal protective equipment is your first line of defense. Always wear appropriate gloves, safety glasses, and insulated tools when working with high-voltage equipment."
          }
        ]
      }
    ],
    author: "Safety Specialist",
    publishedDate: "2024-01-10",
    category: "Safety",
    image: null,
    slug: "top-5-safety-tips-high-voltage"
  },
  {
    id: 3,
    title: "Selling Surplus Gear: What You Need to Know",
    excerpt: "Best practices for listing, pricing, and closing deals on surplus industrial equipment.",
    content: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: "Selling surplus industrial equipment can be a profitable venture, but it requires careful planning and execution. Learn the best practices for maximizing your returns."
          }
        ]
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: "Accurate Documentation"
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: "Proper documentation is essential. Include detailed specifications, maintenance records, and clear photos from multiple angles to build buyer confidence."
          }
        ]
      }
    ],
    author: "Market Expert",
    publishedDate: "2024-01-05",
    category: "Business",
    image: null,
    slug: "selling-surplus-gear-guide"
  }
];

// Generate static params for all blog posts
export async function generateStaticParams() {
  try {
    const slugs = await getAllPostSlugs()
    const fallbackSlugs = fallbackPosts.map(post => post.slug)
    return [...slugs, ...fallbackSlugs].map((slug) => ({
      slug: slug,
    }))
  } catch (error) {
    // If Sanity is not available, only return fallback slugs
    return fallbackPosts.map((post) => ({
      slug: post.slug,
    }))
  }
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

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  let post = null;
  let convertedPost = null;
  const { slug } = await params
  
  try {
    // First try to get the post from Sanity
    post = await getPostBySlug(slug)
    if (post) {
      convertedPost = convertSanityPost(post)
    }
  } catch (error) {
    console.error('Error fetching post from Sanity:', error)
  }
  
  // If not found in Sanity, check fallback posts
  if (!convertedPost) {
    const fallbackPost = fallbackPosts.find(p => p.slug === slug)
    if (fallbackPost) {
      convertedPost = fallbackPost
    }
  }
  
  if (!convertedPost) {
    notFound()
  }

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