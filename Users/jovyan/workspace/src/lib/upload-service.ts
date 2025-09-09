
'use client';

// This function talks to the external image hosting service to handle file uploads.
export async function uploadImage(file: File, path: string): Promise<string> {
    if (!file) {
        throw new Error("No file provided for upload.");
    }

    const uploadToken = process.env.IMAGE_UPLOAD_TOKEN;
    if (!uploadToken) {
        console.error("Image upload token is not configured.");
        throw new Error("Image upload service is not configured. Please contact the administrator.");
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const uploadUrl = 'https://cdn.markjoker.top/api/v1/upload';

        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                // As per API documentation, include Authorization and Accept headers.
                // Do not set Content-Type; the browser will set it automatically for FormData.
                'Authorization': `Bearer ${uploadToken}`,
                'Accept': 'application/json',
            },
            body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.status) {
            throw new Error(result.message || "File upload failed due to a server error.");
        }
        
        // Correctly parse the nested URL from the response as per the API documentation.
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
