
'use client';

// This function talks to the external image hosting service to handle file uploads.
export async function uploadImage(file: File, path: string): Promise<string> {
    if (!file) {
        throw new Error("No file provided for upload.");
    }
    
    const formData = new FormData();
    formData.append('file', file);
    // The 'path' argument is kept for potential future use but is not sent to the image host.

    try {
        const uploadUrl = 'https://cdn.markjoker.top/api/v1/upload';
        
        // Prepare headers
        const headers = new Headers();
        headers.append('Accept', 'application/json');

        // Retrieve the token from an environment variable.
        // This NEXT_PUBLIC_ variable will be exposed to the client-side.
        const apiToken = process.env.NEXT_PUBLIC_IMAGE_HOSTING_TOKEN;

        // Only add the Authorization header if the token is available.
        if (apiToken) {
            headers.append('Authorization', `Bearer ${apiToken}`);
        } else {
            console.warn('IMAGE_HOSTING_TOKEN is not set. Uploading as a guest.');
        }

        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: headers,
            body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.status) {
            throw new Error(result.message || "File upload failed due to a server error.");
        }
        
        // Corrected according to the provided API documentation.
        if (result.data && result.data.links && result.data.links.url) {
            return result.data.links.url;
        } else {
            throw new Error("Image URL not found in the API response.");
        }

    } catch (error) {
        console.error("Upload service error:", error);
        if (error instanceof Error) {
            throw new Error(`Upload failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during file upload.");
    }
}
