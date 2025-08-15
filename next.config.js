
/** @type {import('next').NextConfig} */

// Helper function to extract hostname from a URL
const getHostnameFromUrl = (url) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    // Return hostname, removing port if present
    return urlObj.hostname;
  } catch (e) {
    // Return a default or null if URL is invalid
    return null;
  }
};

const baseUrlHostname = getHostnameFromUrl(process.env.NEXT_PUBLIC_BASE_URL);

const remotePatterns = [
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
    hostname: 'apod.nasa.gov',
  },
  {
    protocol: 'https',
    hostname: 'www.nasa.gov',
  },
  {
    protocol: 'https',
    hostname: 'firebasestorage.googleapis.com'
  }
];

// Add the production hostname only if it's valid and not localhost
if (baseUrlHostname && baseUrlHostname !== 'localhost') {
  const protocol = process.env.NEXT_PUBLIC_BASE_URL?.startsWith('https') ? 'https' : 'http';
  remotePatterns.push({
    protocol: protocol,
    hostname: baseUrlHostname,
  });
}

const nextConfig = {
  images: {
    remotePatterns: remotePatterns,
  },
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    NASA_API_KEY: process.env.NASA_API_KEY,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
