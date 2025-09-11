
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
        process.env.NEXT_PUBLIC_IMAGE_HOST ? {
            protocol: 'https',
            hostname: process.env.NEXT_PUBLIC_IMAGE_HOST,
        } : null,
    ].filter(Boolean),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
