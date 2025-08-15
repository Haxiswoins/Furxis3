
import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
const APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;

// A high-quality fallback image in case APOD is a video or fails to load.
const FALLBACK_IMAGE = {
    title: 'Fallback Galaxy Image',
    url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop',
    media_type: 'image'
};

export async function GET() {
  try {
    const response = await fetch(APOD_URL);

    // If NASA API returns an error, log it and use the fallback.
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`NASA APOD API Error: ${response.status} ${errorBody}`);
      return NextResponse.json(FALLBACK_IMAGE);
    }
    
    const data = await response.json() as any;
    
    // If the media type is not an image, return the fallback image.
    if (data.media_type !== 'image') {
        return NextResponse.json(FALLBACK_IMAGE);
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('APOD route internal error:', error);
    // In case of any other error (e.g., network issues), return the fallback.
    return NextResponse.json(FALLBACK_IMAGE, { status: 500 });
  }
}
