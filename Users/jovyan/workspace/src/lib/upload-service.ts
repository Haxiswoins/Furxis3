
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
        // The API endpoint for the image hosting service.
        const uploadUrl = 'https://cdn.markjoker.top/api/v1/upload';

        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            // Note: Do not manually set the 'Content-Type' header when using FormData.
            // The browser will automatically set it to 'multipart/form-data' with the correct boundary.
        });

        const result = await response.json();

        if (!response.ok || !result.status) {
            // Use the error message from the backend if available
            throw new Error(result.message || "File upload failed due to a server error.");
        }
        
        // The external API returns a structure like { status: true, data: { links: { url: '...' } } }
        if (result.data && result.data.links && result.data.links.url) {
            return result.data.links.url;
        } else {
            throw new Error("Image URL not found in the API response.");
        }

    } catch (error) {
        // Log the actual error for debugging and re-throw a user-friendly message
        console.error("Upload service error:", error);
        if (error instanceof Error) {
            throw new Error(`Upload failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during file upload.");
    }
}
