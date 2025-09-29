
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

  // 3. Get the secure API token from server-side environment variables
  const uploadToken = process.env.IMAGE_UPLOAD_TOKEN;
  if (!uploadToken) {
    console.error("IMAGE_UPLOAD_TOKEN is not configured on the server.");
    return NextResponse.json({ error: 'Image upload service is not configured.' }, { status: 500 });
  }

  // 4. Read file content into a buffer
  const fileBuffer = await file.arrayBuffer();

  // 5. Securely call the external image hosting service
  try {
    const uploadUrl = 'https://cdn.markjoker.top/api/v1/upload';

    // Create a new FormData to forward to the external image host
    const externalFormData = new FormData();
    externalFormData.append('file', new Blob([fileBuffer], { type: file.type }), file.name);

    const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${uploadToken}`,
            'Accept': 'application/json',
        },
        body: externalFormData,
    });
    
    const result = await response.json();

    if (!response.ok || !result.status) {
        console.error('Image host error:', result.message || response.statusText);
        // Try to provide a more specific error if possible
        let errorMessage = "File upload failed at the hosting service.";
        if (result.message) {
            errorMessage = result.message;
        } else if (response.headers.get('content-type')?.includes('text/html')) {
            errorMessage = `Received HTML error page from image host (status: ${response.status})`;
        }
        throw new Error(errorMessage);
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
    // Return a more specific error to the client
    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 500 });
  }
}
