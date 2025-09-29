
'use client';

/**
 * Converts a data URL string to a Blob object.
 * This is necessary for handling images that have been cropped or modified on the client-side,
 * which are often represented as base64 data URLs.
 * @param dataUrl The data URL to convert.
 * @returns The converted Blob object.
 */
function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  // Check if the Data URL format is valid
  if (arr.length < 2) {
    throw new Error('Invalid Data URL: Lacking comma separator.');
  }
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch || mimeMatch.length < 2) {
    throw new Error('Could not determine MIME type from Data URL.');
  }
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}


/**
 * Uploads a file, Blob, or Data URL to the server.
 * It sends the file to our own backend API route (`/api/upload`), which then securely 
 * forwards it to the actual image hosting service. This architecture prevents exposing 
 * the sensitive image hosting API token to the client.
 *
 * @param file - The data to upload. Can be a standard `File` object from an input, a `Blob` (e.g., from a canvas or cropper), or a base64 Data URL string.
 * @param fileName - A descriptive name for the file. This is crucial as it's used by the server and may include path-like structures for organization (e.g., `avatars/user123.png`).
 * @returns A Promise that resolves with the final, public URL of the uploaded image.
 * @throws An error if the upload process fails at any stage.
 */
export async function uploadImage(file: File | Blob | string, fileName: string): Promise<string> {
  let blob: Blob;
  let uploadFileName = fileName;

  // 1. Ensure we have a Blob to work with and determine the correct filename.
  if (typeof file === 'string') {
    // If it's a string, assume it's a Data URL and convert it to a Blob.
    try {
      blob = dataURLtoBlob(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error during Data URL conversion.';
      throw new Error(`Invalid Data URL provided for upload: ${message}`);
    }
  } else if (file instanceof File) {
    // If it's a File object, we can use it directly.
    // The `fileName` parameter is still used for the logical path, but the original file name is also available.
    blob = file;
    uploadFileName = file.name; // Prefer the original file's name.
  } else if (file instanceof Blob) {
    // If it's a generic Blob, use it directly.
    blob = file;
  } else {
    throw new Error("Invalid file type provided. Must be a File, Blob, or Data URL string.");
  }

  // 2. Create FormData and append the blob.
  // The backend expects a field named 'file'.
  const formData = new FormData();
  formData.append('file', blob, uploadFileName);
  
  // 3. Send the request to our backend proxy endpoint.
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      // IMPORTANT: Do NOT set the 'Content-Type' header manually.
      // The browser will automatically set it to 'multipart/form-data' 
      // with the correct boundary, which is essential for the server to parse the file.
    });

    const result = await response.json();

    if (!response.ok) {
      // Use the structured error message from our backend if available, otherwise provide a generic one.
      throw new Error(result.error || `Upload failed with status code: ${response.status}`);
    }

    if (result.url) {
      return result.url;
    } else {
      throw new Error("Image URL was not found in the server's response.");
    }
  } catch (error) {
    console.error("Upload Service Client Error:", error);
    // Re-throw a user-friendly error for the calling component to handle.
    if (error instanceof Error) {
        // Avoid duplicating "Upload failed:" if it's already in the message.
        const message = error.message.startsWith('Upload failed') 
            ? error.message 
            : `Upload failed: ${error.message}`;
        throw new Error(message);
    }
    throw new Error("An unknown error occurred during the file upload process.");
  }
}
