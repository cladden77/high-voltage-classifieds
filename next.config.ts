import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Force Vercel redeploy - dependencies fixed
  experimental: {
    // Help with React state update issues in Sanity Studio
    optimizePackageImports: ['sanity', '@sanity/vision'],
    // Disable Turbopack for studio routes to fix React state update errors
    turbo: {
      rules: {
        '*.tsx': {
          loaders: ['tsx'],
          as: '*.js',
        },
      },
    },
  },
  // Only include studio in development
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      // Exclude studio routes in production
      config.resolve.alias = {
        ...config.resolve.alias,
        'sanity': false,
        '@sanity/vision': false,
      };
    }
    return config;
  },
};

export default nextConfig;
