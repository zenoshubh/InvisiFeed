/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    rules: {
      // Configure any specific loaders if needed
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "react-component",
      },
    },
    resolveAlias: {
      // Add any alias configurations
      "@": "./src",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
};

export default nextConfig;
