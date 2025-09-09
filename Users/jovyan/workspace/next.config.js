
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
        {
            protocol: 'https',
            hostname: 'cdn.markjoker.top',
        },
    ].filter(Boolean),
  },
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    // Image Hosting Service Token
    IMAGE_UPLOAD_TOKEN: process.env.IMAGE_UPLOAD_TOKEN,
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
  // To allow deleting the /api/upload folder, we must remove the route handler.
  // We can do this by adding a no-op rewrites configuration.
  async rewrites() {
    return [
      // This is a no-op rewrite but it allows us to control the routes.
      // By not having a rewrite for /api/upload, we effectively disable it.
    ];
  },
};

export default nextConfig;
