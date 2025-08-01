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
};

export default nextConfig;
