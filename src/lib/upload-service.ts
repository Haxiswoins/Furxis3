
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

  const normalizedFile = normalizeToFile(file, fileName);

  // 2. Create FormData and append the blob
  const formData = new FormData();
  // The backend expects a field named 'file'. We give it a standard name.
  formData.append('file', normalizedFile);


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

function normalizeToFile(file: File | Blob | string, fileName: string): File {
  if (typeof file === "string") {
    // 这里假设 string 是 DataURL
    const arr = file.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "application/octet-stream";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], fileName, { type: mime });
  } else if (file instanceof File) {
    return file;
  } else if (file instanceof Blob) {
    return new File([file], fileName, { type: file.type || "application/octet-stream" });
  }
  throw new Error("Unsupported file type");
}

