
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

  // 2. Get the form data from the incoming request
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

  // 4. Securely call the external image hosting service
  try {
    const uploadUrl = 'https://cdn.markjoker.top/api/v1/upload';

    // We re-create the FormData to ensure a clean payload is sent.
    const externalFormData = new FormData();
    externalFormData.append('file', file, file.name);

    const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${uploadToken}`,
            'Accept': 'application/json',
        },
        body: externalFormData,
    });

    // --- Robust Error Handling ---
    // If the response from the image host is not successful...
    if (!response.ok) {
        let errorMessage = `Image host failed with status: ${response.status}`;
        const contentType = response.headers.get('content-type');

        // ...try to parse the error payload for a more specific message.
        try {
            if (contentType && contentType.includes('application/json')) {
                const errorResult = await response.json();
                errorMessage = errorResult.message || JSON.stringify(errorResult);
            } else {
                // If it's not JSON, it's likely an HTML error page or plain text.
                const errorText = await response.text();
                // Don't send the entire HTML page to the client, just log it for debugging.
                console.error('Image host returned a non-JSON error response:', errorText);
                errorMessage = "The image hosting service returned an unexpected error. Check server logs.";
            }
        } catch (e) {
            // This catches errors from parsing the error response itself.
            console.error('Could not parse error response from image host:', e);
            errorMessage = "Failed to parse the error response from the image hosting service.";
        }
        // Throw an error to be caught by the main catch block below.
        throw new Error(errorMessage);
    }

    // --- Success Path ---
    // If we get here, the response was OK (2xx status code).
    const result = await response.json();

    // The hosting service might still indicate a failure in the JSON body.
    if (!result.status) {
        console.error('Image host returned a failed status:', result.message);
        throw new Error(result.message || "The hosting service reported a failure.");
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
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    // This will now correctly return a JSON formatted error to the client.
    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 500 });
  }
}
