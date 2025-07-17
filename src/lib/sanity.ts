import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// Sanity client configuration
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: true, // Enable for faster, cached content
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN, // Only needed for writes
})

// Image URL builder
const builder = imageUrlBuilder(sanityClient)

export const urlFor = (source: any) => builder.image(source)

// Blog post type
export interface BlogPost {
  _id: string
  _type: 'post'
  title: string
  slug: {
    _type: 'slug'
    current: string
  }
  excerpt: string
  content: any[] // Rich text content
  author: {
    name: string
    image?: any
  }
  publishedDate: string
  category: string
  featuredImage?: any
  tags?: string[]
}

// Sanity queries
export const blogQueries = {
  // Get all published blog posts
  getAllPosts: `*[_type == "post" && publishedDate < now()] | order(publishedDate desc) {
    _id,
    title,
    slug,
    excerpt,
    author->{name, image},
    publishedDate,
    category,
    featuredImage,
    tags
  }`,

  // Get a single post by slug
  getPostBySlug: (slug: string) => `*[_type == "post" && slug.current == "${slug}"][0] {
    _id,
    title,
    slug,
    excerpt,
    content,
    author->{name, image},
    publishedDate,
    category,
    featuredImage,
    tags
  }`,

  // Get posts by category
  getPostsByCategory: (category: string) => `*[_type == "post" && category == "${category}" && publishedDate < now()] | order(publishedDate desc) {
    _id,
    title,
    slug,
    excerpt,
    author->{name, image},
    publishedDate,
    category,
    featuredImage,
    tags
  }`,

  // Get featured posts
  getFeaturedPosts: `*[_type == "post" && featured == true && publishedDate < now()] | order(publishedDate desc)[0...3] {
    _id,
    title,
    slug,
    excerpt,
    author->{name, image},
    publishedDate,
    category,
    featuredImage,
    tags
  }`,

  // Get all categories
  getCategories: `*[_type == "post" && publishedDate < now()].category | order(@) {
    category
  }`,
}

// Blog service functions
export class BlogService {
  static async getAllPosts(): Promise<BlogPost[]> {
    try {
      const posts = await sanityClient.fetch(blogQueries.getAllPosts)
      return posts || []
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      return []
    }
  }

  static async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const post = await sanityClient.fetch(blogQueries.getPostBySlug(slug))
      return post || null
    } catch (error) {
      console.error('Error fetching blog post:', error)
      return null
    }
  }

  static async getPostsByCategory(category: string): Promise<BlogPost[]> {
    try {
      const posts = await sanityClient.fetch(blogQueries.getPostsByCategory(category))
      return posts || []
    } catch (error) {
      console.error('Error fetching posts by category:', error)
      return []
    }
  }

  static async getFeaturedPosts(): Promise<BlogPost[]> {
    try {
      const posts = await sanityClient.fetch(blogQueries.getFeaturedPosts)
      return posts || []
    } catch (error) {
      console.error('Error fetching featured posts:', error)
      return []
    }
  }

  static async getCategories(): Promise<string[]> {
    try {
      const categories: any[] = await sanityClient.fetch(blogQueries.getCategories)
      return [...new Set(categories.map((c: any) => c.category).filter(Boolean))] as string[]
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }
}

// Sanity schema definitions (for reference)
export const sanitySchemas = {
  post: {
    name: 'post',
    title: 'Blog Post',
    type: 'document',
    fields: [
      {
        name: 'title',
        title: 'Title',
        type: 'string',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'slug',
        title: 'Slug',
        type: 'slug',
        options: {
          source: 'title',
          maxLength: 96,
        },
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'excerpt',
        title: 'Excerpt',
        type: 'text',
        validation: (Rule: any) => Rule.required().max(200),
      },
      {
        name: 'content',
        title: 'Content',
        type: 'array',
        of: [
          {
            type: 'block',
          },
          {
            type: 'image',
            options: { hotspot: true },
          },
        ],
      },
      {
        name: 'author',
        title: 'Author',
        type: 'reference',
        to: [{ type: 'author' }],
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'publishedDate',
        title: 'Published Date',
        type: 'datetime',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'category',
        title: 'Category',
        type: 'string',
        options: {
          list: [
            { title: 'Solar Energy', value: 'solar-energy' },
            { title: 'Safety', value: 'safety' },
            { title: 'Equipment Guide', value: 'equipment-guide' },
            { title: 'Market Analysis', value: 'market-analysis' },
            { title: 'Industry News', value: 'industry-news' },
          ],
        },
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'featuredImage',
        title: 'Featured Image',
        type: 'image',
        options: { hotspot: true },
      },
      {
        name: 'tags',
        title: 'Tags',
        type: 'array',
        of: [{ type: 'string' }],
      },
      {
        name: 'featured',
        title: 'Featured Post',
        type: 'boolean',
        description: 'Mark this post as featured',
      },
    ],
    preview: {
      select: {
        title: 'title',
        author: 'author.name',
        media: 'featuredImage',
      },
      prepare(selection: any) {
        const { author } = selection
        return {
          ...selection,
          subtitle: author && `by ${author}`,
        }
      },
    },
  },

  author: {
    name: 'author',
    title: 'Author',
    type: 'document',
    fields: [
      {
        name: 'name',
        title: 'Name',
        type: 'string',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'image',
        title: 'Image',
        type: 'image',
        options: { hotspot: true },
      },
      {
        name: 'bio',
        title: 'Bio',
        type: 'text',
      },
    ],
    preview: {
      select: {
        title: 'name',
        media: 'image',
      },
    },
  },
} 