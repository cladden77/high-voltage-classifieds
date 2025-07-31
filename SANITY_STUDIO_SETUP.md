# Sanity Studio Setup

This project now includes a self-hosted Sanity Studio for content management.

## Access

- **Development**: Visit `/studio` - no password required
- **Production**: Visit `/studio` - password protected (default: `admin123`)

## Configuration

### Project Settings
- **Project ID**: `jrlt8k3v`
- **Dataset**: `production`
- **Base Path**: `/studio`

### Schema Structure

#### Blog Post (`post`)
- `title` (string, required) - Post title
- `slug` (slug, required) - URL-friendly identifier
- `publishedAt` (datetime, required) - Publication date
- `excerpt` (text, required) - Short description (max 200 chars)
- `mainImage` (image) - Featured image with hotspot
- `body` (array, required) - Rich text content with blocks and images
- `author` (reference) - Link to author document
- `category` (string) - Post category with predefined options

#### Author (`author`)
- `name` (string, required) - Author name
- `image` (image) - Author profile picture
- `bio` (text) - Author biography

## Features

### Content Management
- **Rich Text Editor**: Full-featured text editor with formatting options
- **Image Management**: Upload and manage images with hotspot functionality
- **Slug Generation**: Automatic slug generation from title
- **Validation**: Required field validation and character limits
- **Preview**: Live preview of content structure

### Studio Features
- **Desk Tool**: Main content management interface
- **Vision Tool**: Query and explore your content
- **Real-time Collaboration**: Multiple users can edit simultaneously
- **Version History**: Track changes and revert if needed

## Usage

### Creating Blog Posts
1. Navigate to `/studio`
2. Click "Blog Post" in the left sidebar
3. Click "Create new" button
4. Fill in the required fields:
   - **Title**: The post title
   - **Slug**: Auto-generated from title (can be edited)
   - **Published At**: Set the publication date
   - **Excerpt**: Write a brief description
   - **Main Image**: Upload a featured image
   - **Body**: Write the main content using the rich text editor
   - **Author**: Select an existing author or create a new one
   - **Category**: Choose from predefined categories

### Managing Authors
1. Navigate to "Author" in the sidebar
2. Create new authors with name, image, and bio
3. Authors can be referenced in blog posts

### Content Types
- **Text Blocks**: Paragraphs, headings, lists
- **Images**: Inline images with alt text and captions
- **Hotspots**: Click and drag to set image focus points

## Security

### Development
- No authentication required
- Accessible at `/studio`

### Production
- Password protection enabled
- Default password: `admin123`
- Change password in `src/app/studio/[[...index]]/page.tsx`

## Customization

### Adding New Fields
1. Edit `src/schemas/post.ts`
2. Add new field definitions
3. Update the blog components to display new fields

### Changing Categories
1. Edit the `category` field options in `src/schemas/post.ts`
2. Update the predefined list as needed

### Styling
- Studio uses Sanity's default styling
- Can be customized with CSS overrides if needed

## Troubleshooting

### Common Issues
1. **Build Errors**: Ensure all dependencies are installed
2. **Studio Not Loading**: Check network connectivity to Sanity
3. **Images Not Displaying**: Verify image upload permissions

### Dependencies
- `sanity` - Core Sanity library
- `@sanity/vision` - Vision tool for content exploration
- `next-sanity` - Next.js integration
- `styled-components` - UI styling
- `react-is` - React utilities

## Next Steps

1. **Create Content**: Start adding blog posts and authors
2. **Customize Schema**: Add more fields as needed
3. **Deploy**: Deploy to production and test the studio
4. **Security**: Change the default password for production use 