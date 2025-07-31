import { sanityClient } from './sanityClient'
import imageUrlBuilder from '@sanity/image-url'

// Image URL builder
const builder = imageUrlBuilder(sanityClient)
export const urlFor = (source: any) => builder.image(source)

// Types for Sanity blog posts
export interface SanityPost {
  _id: string
  _type: 'post'
  title: string
  slug: {
    current: string
  }
  publishedAt: string
  excerpt: string
  mainImage?: {
    asset: {
      _ref: string
    }
  }
  body: any[] // PortableText content
  author?: {
    name: string
  }
  category?: string
}

// Query to get all blog posts
export const getAllPostsQuery = `*[_type == "post"] | order(publishedAt desc)[0...5] {
  _id,
  _type,
  title,
  slug,
  publishedAt,
  excerpt,
  mainImage,
  body,
  author->{name},
  category
}`

// Query to get a single post by slug
export const getPostBySlugQuery = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  _type,
  title,
  slug,
  publishedAt,
  excerpt,
  mainImage,
  body,
  author->{name},
  category
}`

// Function to get all posts
export async function getAllPosts(): Promise<SanityPost[]> {
  return await sanityClient.fetch(getAllPostsQuery)
}

// Function to get a single post by slug
export async function getPostBySlug(slug: string): Promise<SanityPost | null> {
  return await sanityClient.fetch(getPostBySlugQuery, { slug })
}

// Function to get all post slugs for static generation
export async function getAllPostSlugs(): Promise<string[]> {
  const query = `*[_type == "post"]{ slug }`
  const posts = await sanityClient.fetch(query)
  return posts.map((post: { slug: { current: string } }) => post.slug.current)
} 