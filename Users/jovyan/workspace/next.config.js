
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
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
