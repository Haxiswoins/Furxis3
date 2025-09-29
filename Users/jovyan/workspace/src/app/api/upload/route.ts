
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import type { SessionData } from '@/lib/session';

// This is the secure, server-side proxy for image uploads.
export async function POST(req: NextRequest) {
  // 1. Authenticate the user session
  const session = await getIronSession<SessionData>(cookies(), {
    password: process.env.AUTHING_SECRET!,
    cookieName: 'suitopia-session',
  });

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized: You must be logged in to upload files.' }, { status: 401 });
  }

  // 2. Get the file from the incoming request
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  // 3. Get the secure API token and host from server-side environment variables
  const uploadToken = process.env.IMAGE_UPLOAD_TOKEN;
  const uploadHost = process.env.NEXT_PUBLIC_IMAGE_HOST;

  if (!uploadToken || !uploadHost) {
    console.error("IMAGE_UPLOAD_TOKEN or NEXT_PUBLIC_IMAGE_HOST is not configured on the server.");
    return NextResponse.json({ error: 'Image upload service is not configured.' }, { status: 500 });
  }

  // 4. Create a new FormData to forward to the external image host
  const externalFormData = new FormData();
  externalFormData.append('file', file);
  
  // 5. Securely call the external image hosting service
  try {
    const uploadUrl = `https://${uploadHost}/api/v1/upload`;

    const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            // Securely add the Authorization token from the server-side environment
            'Authorization': `Bearer ${uploadToken}`,
            'Accept': 'application/json',
        },
        body: externalFormData,
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
        // Log the actual error from the image host for debugging
        console.error('Image host error:', result.message);
        throw new Error(result.message || "File upload failed at the hosting service.");
    }
    
    // 6. Extract the final URL and return it to the client
    if (result.data && result.data.links && result.data.links.url) {
        return NextResponse.json({ url: result.data.links.url });
    } else {
        console.error('Unexpected response format from image host:', result);
        throw new Error("Image URL not found in the hosting service response.");
    }

  } catch (error) {
    console.error("Server-side upload error:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred during upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
