
import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
const APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;

export async function GET() {
  try {
    const response = await fetch(APOD_URL);
    if (!response.ok) {
      // Log the error from NASA's API for debugging
      const errorBody = await response.text();
      console.error(`NASA APOD API Error: ${response.status} ${errorBody}`);
      throw new Error(`Failed to fetch data from NASA API. Status: ${response.status}`);
    }
    const data = await response.json();
    
    // We only want to return image media types
    if (data.media_type !== 'image') {
        // You could fetch another day, but for simplicity, we'll return a placeholder
        // This prevents the frontend from trying to render a video
        return NextResponse.json({ 
            title: 'Fallback Image',
            url: 'https://placehold.co/1920x1080/000000/FFFFFF.png?text=Space',
            media_type: 'image'
        });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('APOD route error:', error);
    // In case of any error, return a standard placeholder
    // to ensure the frontend still has an image to display.
    const fallbackImage = {
        title: 'Error Fetching Image',
        url: 'https://placehold.co/1920x1080/000000/FFFFFF.png?text=Error',
        media_type: 'image'
    };
    return NextResponse.json(fallbackImage, { status: 500 });
  }
}
