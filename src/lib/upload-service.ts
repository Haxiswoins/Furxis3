
'use client';

// This function now sends the file to our own backend API route,
// which then securely forwards it to the image hosting service.
// This prevents exposing the image hosting API token to the client.
export async function uploadImage(file: File, path: string): Promise<string> {
    if (!file) {
        throw new Error("No file provided for upload.");
    }
    
    const formData = new FormData();
    formData.append('file', file);
    // The 'path' argument from the original call is kept for potential future use,
    // but the backend will generate its own path for security.
    formData.append('path', path); 
    
    try {
        // We now point to our own internal API endpoint.
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            // Do not set Content-Type, the browser does it automatically for FormData
        });

        const result = await response.json();

        if (!response.ok) {
            // Use the error message from our backend if available
            throw new Error(result.error || "File upload failed due to a server error.");
        }
        
        // Our backend now directly provides the final URL.
        if (result.url) {
            return result.url;
        } else {
            throw new Error("Image URL not found in the API response from our server.");
        }

    } catch (error) {
        console.error("Upload service error:", error);
        if (error instanceof Error) {
            throw new Error(`Upload failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during file upload.");
    }
}
