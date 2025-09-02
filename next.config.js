
/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
        {
            protocol: 'https',
            hostname: 'placehold.co',
        },
        {
            protocol: 'https',
            hostname: 'images.unsplash.com',
        },
        {
            protocol: 'https',
            hostname: 'files.authing.co',
        },
        // For self-hosted images on the production server
        // This will be dynamically set from the environment variable
        process.env.NEXT_PUBLIC_BASE_URL
        ? {
            protocol: new URL(process.env.NEXT_PUBLIC_BASE_URL).protocol.slice(0, -1) as 'http' | 'https',
            hostname: new URL(process.env.NEXT_PUBLIC_BASE_URL).hostname,
          }
        : {},
    ].filter(Boolean),
  },
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    // Authing variables
    AUTHING_APP_ID: process.env.AUTHING_APP_ID,
    AUTHING_APP_SECRET: process.env.AUTHING_APP_SECRET,
    AUTHING_ISSUER: process.env.AUTHING_ISSUER,
    AUTHING_SECRET: process.env.AUTHING_SECRET,
    AUTHING_REDIRECT_URI: process.env.AUTHING_REDIRECT_URI,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
