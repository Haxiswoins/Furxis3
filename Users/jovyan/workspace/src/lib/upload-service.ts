
'use client';

// This function talks to our own backend API endpoint to handle file uploads securely.
export async function uploadImage(file: File, path: string): Promise<string> {
    if (!file) {
        throw new Error("No file provided for upload.");
    }
    
    const formData = new FormData();
    formData.append('file', file);
    // The 'path' argument is kept for potential future use but is not sent to our backend.

    try {
        // The API endpoint is now our own internal route.
        const uploadUrl = '/api/upload';
        
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
            // Use the error message from our backend if available
            throw new Error(result.error || "File upload failed due to a server error.");
        }
        
        // Our backend returns a JSON object with a `url` property on success.
        if (result.url) {
            return result.url;
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
