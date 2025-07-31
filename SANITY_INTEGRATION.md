# Sanity CMS Integration

This project has been successfully integrated with Sanity CMS for blog content management.

## Configuration

### Sanity Client Setup
- **Project ID**: `jrlt8k3v`
- **Dataset**: `production`
- **API Version**: `2023-07-31`
- **CDN**: Enabled for faster content delivery

### Files Created/Modified

1. **`src/lib/sanityClient.ts`** - Sanity client configuration
2. **`src/lib/sanity.ts`** - Types, queries, and utility functions
3. **`src/app/blog/page.tsx`** - Updated to fetch from Sanity (server-side rendering)
4. **`src/app/blog/[slug]/page.tsx`** - Dynamic route for individual blog posts

## Features

### Blog Post Structure
Each blog post includes:
- `title` - Post title
- `slug` - URL-friendly identifier
- `publishedAt` - Publication date
- `excerpt` - Short description
- `mainImage` - Featured image
- `body` - PortableText content
- `author` - Author information
- `category` - Post category

### Queries
- **All Posts**: `*[_type == "post"] | order(publishedAt desc)[0...5]`
- **Single Post**: `*[_type == "post" && slug.current == $slug][0]`
- **All Slugs**: For static generation

### Rendering
- **PortableText**: Rich text content rendering with custom components
- **Image Handling**: Automatic image URL generation with Sanity's image URL builder
- **Static Generation**: All blog posts are pre-rendered at build time

## Usage

### Adding New Blog Posts
1. Create posts in your Sanity Studio
2. Ensure posts have the required fields (title, slug, publishedAt, excerpt, body)
3. Deploy to see changes on the website

### Customizing Content
- Modify `portableTextComponents` in `[slug]/page.tsx` to customize rich text rendering
- Update queries in `sanity.ts` to fetch different data
- Adjust styling in the blog components as needed

## Dependencies
- `@sanity/client` - Sanity client library
- `@sanity/image-url` - Image URL builder
- `@portabletext/react` - Rich text rendering

## Environment Variables
No environment variables are required as the Sanity project ID is hardcoded. For production, consider moving sensitive data to environment variables. 