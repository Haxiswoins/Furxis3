
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import type { SessionData } from '@/lib/session';

// This is the secure, server-side proxy for image uploads.
export async function POST(req: NextRequest) {
  // 1. Authenticate the user session to prevent unauthorized uploads.
  const session = await getIronSession<SessionData>(cookies(), {
    password: process.env.AUTHING_SECRET!,
    cookieName: 'suitopia-session',
  });

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized: You must be logged in to upload files.' }, { status: 401 });
  }

  // 2. Get the secure API token and host from server-side environment variables.
  const uploadToken = process.env.IMAGE_UPLOAD_TOKEN;
  const uploadHost = process.env.NEXT_PUBLIC_IMAGE_HOST;

  if (!uploadToken || !uploadHost) {
    console.error("IMAGE_UPLOAD_TOKEN or NEXT_PUBLIC_IMAGE_HOST is not configured on the server.");
    return NextResponse.json({ error: 'Image upload service is not configured.' }, { status: 500 });
  }
  
  try {
    // 3. Correctly parse the multipart/form-data from the incoming request.
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file found in the request.' }, { status: 400 });
    }

    // 4. Re-create a new FormData to forward to the external image host.
    // This is the correct and robust way to handle file proxying.
    const externalFormData = new FormData();
    externalFormData.append('file', file);
    
    // 5. Securely call the external image hosting service with the new FormData.
    const uploadUrl = `https://${uploadHost}/api/v1/upload`;

    const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            // The 'Authorization' and 'Accept' headers are necessary.
            'Authorization': `Bearer ${uploadToken}`,
            'Accept': 'application/json',
            // IMPORTANT: Do NOT set the 'Content-Type' header here.
            // `fetch` will automatically set it to 'multipart/form-data' with the correct boundary
            // when the body is a FormData object.
        },
        body: externalFormData,
    });

    // --- Robust Error Handling ---
    if (!response.ok) {
        // Attempt to parse the error response from the image host.
        let errorMessage = `Image host failed with status: ${response.status}`;
        try {
            const errorResult = await response.json();
            errorMessage = errorResult.message || JSON.stringify(errorResult);
        } catch (e) {
            // If the error response isn't JSON, read it as text.
            const errorText = await response.text();
            console.error('Image host returned a non-JSON error response:', errorText);
            // Handle specific plain text errors from this particular image server if needed.
            if (errorText && errorText.toLowerCase().includes('unsupported file type')) {
                errorMessage = '不支持的文件类型';
            } else {
                errorMessage = "图片托管服务返回了意外的文本错误，请检查服务器日志。";
            }
        }
        // Throw an error that will be caught and sent back to the client.
        throw new Error(errorMessage);
    }

    // --- Success Path ---
    const result = await response.json();

    if (result.status === false) {
        console.error('Image host returned a failed status:', result.message);
        throw new Error(result.message || "图片托管服务报告了一个未知失败。");
    }
    
    // 6. Extract the final URL and return it to the client.
    // The previous logic used `result.data.links.url`, the correct path is `result.data.url`
    if (result.data && result.data.url) {
        return NextResponse.json({ url: result.data.url });
    } else {
        console.error('Unexpected success response format from image host:', result);
        throw new Error("在图片托管服务的响应中未找到图片 URL。");
    }

  } catch (error) {
    console.error("Server-side upload proxy error:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred during the server-side upload.";
    // Ensure the client gets a consistent error format.
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
