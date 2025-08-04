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
  },
  // Handle Sanity Studio in production
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      // Ensure Sanity Studio works in production
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }
    return config;
  },
};

export default nextConfig;
