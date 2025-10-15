
'use client';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Converts a data URL string to a Blob object.
 * @param dataUrl The data URL to convert.
 * @returns The converted Blob object.
 */
function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
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


function normalizeToFile(file: File | Blob | string, fileName: string): File {
  if (typeof file === "string") {
    // This assumes the string is a DataURL
    const blob = dataURLtoBlob(file);
    return new File([blob], fileName, { type: blob.type });
  } else if (file instanceof File) {
    return file;
  } else if (file instanceof Blob) {
    return new File([file], fileName, { type: file.type || "application/octet-stream" });
  }
  throw new Error("Unsupported file type provided to normalizeToFile.");
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
  const normalizedFile = normalizeToFile(file, fileName);

  // Frontend validation: Check MIME type before uploading
  if (!ALLOWED_IMAGE_TYPES.includes(normalizedFile.type)) {
    throw new Error(`不支持的文件类型。请上传以下格式的图片： ${ALLOWED_IMAGE_TYPES.join(', ')}`);
  }

  const formData = new FormData();
  formData.append('file', normalizedFile);
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Upload failed with status code: ${response.status}`);
    }

    if (result.url) {
      return result.url;
    } else {
      throw new Error("Image URL was not found in the server's response.");
    }
  } catch (error) {
    console.error("Upload Service Client Error:", error);
    if (error instanceof Error) {
        const message = error.message.startsWith('Upload failed') 
            ? error.message 
            : `上传失败: ${error.message}`;
        throw new Error(message);
    }
    throw new Error("上传文件时发生未知错误。");
  }
}
