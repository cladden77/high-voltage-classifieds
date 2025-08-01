# High Voltage Classifieds

A modern, responsive website for buying and selling surplus high voltage equipment. Built with Next.js, TypeScript, and TailwindCSS.

## Features

- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with custom typography and color scheme
- **Mobile Navigation**: Hamburger menu for mobile devices
- **Interactive Elements**: Hover effects, transitions, and interactive forms
- **Optimized Performance**: Built with Next.js for optimal loading speeds
- **TypeScript**: Type-safe development with TypeScript
- **TailwindCSS**: Utility-first CSS framework for rapid development
- **Component Architecture**: Modular, reusable components for easy maintenance

## Design System

### Colors
- **Primary Orange**: #f37121
- **Secondary Red**: #ef4744
- **Charcoal**: #1b1b1b
- **Navy Blue**: #111827
- **Gray**: #928c8e

### Fonts
- **Staatliches**: For headings and display text
- **Open Sans**: For body text and UI elements

## Sections

1. **Header**: Navigation with mobile hamburger menu
2. **Hero Section**: Main banner with search functionality
3. **Featured Listings**: Showcase of equipment for sale
4. **How It Works**: Three-step process explanation
5. **Trust Section**: Professional credibility messaging
6. **Blog Section**: Latest articles and resources
7. **Call to Action**: Encourage equipment listing
8. **Footer**: Links, contact info, and newsletter signup

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technology Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **Font Loading**: Next.js Google Fonts optimization
- **Development**: Hot reload and fast refresh

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles and custom CSS
│   ├── layout.tsx       # Root layout with fonts and metadata
│   └── page.tsx         # Main homepage with component imports
└── components/
    ├── Header.tsx       # Navigation and mobile menu
    ├── HeroSection.tsx  # Main banner with search
    ├── FeaturedListings.tsx # Equipment showcase grid
    ├── HowItWorks.tsx   # Process explanation
    ├── TrustSection.tsx # Credibility messaging
    ├── BlogSection.tsx  # Blog previews
    ├── CallToAction.tsx # CTA banner
    └── Footer.tsx       # Footer links and newsletter
```

## Component Architecture

Each section of the homepage is built as a reusable React component:

- **Header**: Client component with mobile menu state management
- **HeroSection**: Server component with search form
- **FeaturedListings**: Dynamic component with equipment data mapping
- **HowItWorks**: Static component with step illustrations
- **TrustSection**: Branding and trust messaging
- **BlogSection**: Blog preview cards with dynamic content
- **CallToAction**: Conversion-focused CTA section
- **Footer**: Site-wide footer with contact and social links

This modular approach enables:
- Easy maintenance and updates
- Component reusability across pages
- Better code organization
- Simplified testing and debugging

## Build and Deploy

To build for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Contributing

This project is designed to match the provided Figma design specifications exactly, including:
- Typography scales and font families
- Color palette and brand colors
- Layout spacing and component sizing
- Responsive breakpoints and mobile behavior

---

Built with ❤️ using Next.js and TailwindCSS
