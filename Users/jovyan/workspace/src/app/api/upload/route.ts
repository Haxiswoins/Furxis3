
import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'buffer';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // The external image hosting service endpoint
    const uploadUrl = 'https://cdn.markjoker.top/api/v1/upload';
    
    // We create a new FormData to forward the file
    const externalFormData = new FormData();
    externalFormData.append('file', file);

    // Prepare headers for the external request
    const headers = new Headers();
    const apiToken = process.env.IMAGE_HOSTING_TOKEN;

    if (apiToken) {
        headers.append('Authorization', `Bearer ${apiToken}`);
    } else {
        console.warn('IMAGE_HOSTING_TOKEN is not set on the server. Uploading as a guest.');
    }
    // Let fetch set the multipart/form-data Content-Type header with the correct boundary
    
    const externalResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: headers,
        body: externalFormData,
    });

    const result = await externalResponse.json();

    if (!externalResponse.ok || !result.status) {
        // Forward the error from the external service
        return NextResponse.json({ error: result.message || 'External upload service failed.' }, { status: externalResponse.status });
    }
    
    // The external API returns a structure like { status: true, data: { links: { url: '...' } } }
    if (result.data && result.data.links && result.data.links.url) {
        // On success, return a JSON object with the URL
        return NextResponse.json({ url: result.data.links.url }, { status: 200 });
    } else {
        return NextResponse.json({ error: 'Image URL not found in the external API response.' }, { status: 500 });
    }

  } catch (error) {
    console.error('API route /api/upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown internal server error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
