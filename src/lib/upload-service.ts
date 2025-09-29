
'use client';

/**
 * Converts a data URL string to a Blob object.
 * @param dataUrl The data URL to convert.
 * @returns The converted Blob object.
 */
function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  // Check if the Data URL format is valid
  if (arr.length < 2) {
    throw new Error('Invalid Data URL');
  }
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch || mimeMatch.length < 2) {
    throw new Error('Could not determine MIME type from Data URL');
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
 * It sends the file to our own backend API route, which then securely forwards it to the image hosting service.
 * This prevents exposing the image hosting API token to the client.
 * @param file - The file to upload (can be a File, Blob, or a base64 Data URL string).
 * @param fileName - A descriptive name for the file, used when uploading.
 * @returns A Promise that resolves with the final URL of the uploaded image.
 */
export async function uploadImage(file: File | Blob | string, fileName: string): Promise<string> {
  let blob: Blob;

  // 1. Ensure we have a Blob to work with
  if (typeof file === 'string') {
    // If it's a string, assume it's a Data URL and convert it
    try {
      blob = dataURLtoBlob(file);
    } catch (error) {
      throw new Error(`Invalid Data URL provided for upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else if (file instanceof File || file instanceof Blob) {
    // If it's already a File or Blob, use it directly
    blob = file;
  } else {
    throw new Error("Invalid file type provided for upload. Must be a File, Blob, or Data URL string.");
  }

  // *** DIAGNOSTIC LOGGING ***
  console.log('Uploading file with type:', blob.type, 'and size:', blob.size);

  // 2. Create FormData and append the blob
  const formData = new FormData();
  // The backend expects a field named 'file'. We give it a standard name.
  formData.append('file', blob, fileName);

  // 3. Send the request to our backend proxy
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      // Do not set 'Content-Type'; the browser correctly sets it for FormData with the boundary.
    });

    const result = await response.json();

    if (!response.ok) {
      // Use the structured error message from our backend if available
      throw new Error(result.error || `Upload failed with status: ${response.status}`);
    }

    if (result.url) {
      return result.url;
    } else {
      throw new Error("Image URL not found in the server response.");
    }
  } catch (error) {
    console.error("Upload service error:", error);
    // Re-throw the error with a more descriptive message for the calling component to handle
    if (error instanceof Error) {
        // Avoid duplicating "Upload failed:"
        const message = error.message.startsWith('Upload failed') ? error.message : `Upload failed: ${error.message}`;
        throw new Error(message);
    }
    throw new Error("An unknown error occurred during file upload.");
  }
}
