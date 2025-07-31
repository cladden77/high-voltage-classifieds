import React from "react";
import { getAllPosts, SanityPost } from '@/lib/sanity';
import { urlFor } from '@/lib/sanity';
import Link from 'next/link';

// Convert Sanity post to our blog post format
function convertSanityPost(post: SanityPost) {
  const excerpt = post.excerpt || '';
  return {
    id: post._id,
    title: post.title,
    excerpt: excerpt.length > 100 ? excerpt.substring(0, 100) + '...' : excerpt,
    image: post.mainImage ? urlFor(post.mainImage).url() : null,
    slug: post.slug.current,
    publishedDate: post.publishedAt,
    author: post.author?.name || 'Anonymous'
  }
}

export default async function BlogSection() {
  let posts = [];
  
  try {
    // Fetch the latest 3 posts from Sanity
    const sanityPosts = await getAllPosts();
    posts = sanityPosts.slice(0, 3).map(convertSanityPost);
    console.log('Sanity posts found:', posts.length);
  } catch (error) {
    console.error('Error fetching blog posts from Sanity:', error);
    // If there's an error, show an empty state instead of fallback posts
    posts = [];
  }

  // If no posts from Sanity, show empty state
  if (posts.length === 0) {
    return (
      <section className="bg-neutral-50 px-4 lg:px-20 py-16">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="font-staatliches text-[#1b1b1b] text-4xl md:text-5xl text-center tracking-[-1.2px] leading-tight mb-10">
            From the Blog
          </h2>
          
          <div className="text-center py-12">
            <p className="text-neutral-600 text-lg mb-4">
              No blog posts available yet.
            </p>
            <p className="text-neutral-500">
              Check back soon for industry insights and updates.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-neutral-50 px-4 lg:px-20 py-16">
      <div className="max-w-[1280px] mx-auto">
        <h2 className="font-staatliches text-[#1b1b1b] text-4xl md:text-5xl text-center tracking-[-1.2px] leading-tight mb-10">
          From the Blog
        </h2>
        
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 ${
          posts.length < 3 ? 'justify-items-center' : ''
        }`}>
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow w-full">
              <div className="flex flex-col lg:flex-row lg:h-80">
                <div className="bg-neutral-100 w-full lg:w-48 h-48 lg:h-full flex-shrink-0">
                  {post.image ? (
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                      <span className="text-neutral-500 text-sm">Blog Image</span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between min-h-0">
                  <div className="flex-1">
                    <Link href={`/blog/${post.slug}`} className="block hover:opacity-80 transition-opacity">
                      <h3 className="font-bold text-[#1b1b1b] text-lg leading-6 mb-2 hover:text-[#ef4744] transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                    {post.excerpt && (
                      <div className="mb-4">
                        <p className="text-neutral-600 leading-6 line-clamp-4 text-sm">
                          {post.excerpt}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-auto pt-4 border-t border-neutral-100">
                    <Link 
                      href={`/blog/${post.slug}`} 
                      className="inline-flex items-center text-[#ef4744] font-bold hover:underline hover:text-[#d63d3a] transition-colors"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 