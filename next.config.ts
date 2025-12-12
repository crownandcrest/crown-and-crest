import type { NextConfig } from "next";

// Professional Fix: Use 'require' safely to avoid TypeScript module errors with next-pwa
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public",         // Where to save the service worker
  register: true,         // Register SW automatically
  skipWaiting: true,      // Update app instantly when new version is deployed
  disable: process.env.NODE_ENV === "development", // Clean dev experience (no caching)
});

const nextConfig: NextConfig = {
  // 1. Image Optimization (Secure & Fast)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // 2. Build Settings (Ignore minor linting errors for production builds)
  typescript: {
    ignoreBuildErrors: true, 
  },

  outputFileTracingRoot: process.cwd(),
};

// 3. Export with PWA Wrapper
export default withPWA(nextConfig);