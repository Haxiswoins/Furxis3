
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import type { SessionData } from '@/lib/session';

// This is the secure, server-side proxy for image uploads.
export async function POST(req: NextRequest) {
  // 1. Authenticate the user session
  const session = await getIronSession<SessionData>(cookies(), {
    password: process.env.AUTHING_SECRET!,
    cookieName: 'suitopia-session',
  });

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized: You must be logged in to upload files.' }, { status: 401 });
  }

  // 2. Get the file from the incoming request
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  
  // 2. Get the secure API token from server-side environment variables
  const uploadToken = process.env.IMAGE_UPLOAD_TOKEN;
  if (!uploadToken) {
    console.error("IMAGE_UPLOAD_TOKEN is not configured on the server.");
    return NextResponse.json({ error: 'Image upload service is not configured.' }, { status: 500 });
  }

  // 3. Get the Content-Type from the original request.
  // This is CRITICAL for the external server to understand the multipart/form-data payload.
  const contentType = req.headers.get('content-type');
  if (!contentType) {
      return NextResponse.json({ error: 'Content-Type header is missing.' }, { status: 400 });
  }

  const externalFormData = new FormData();
  externalFormData.append('file', file);

  // 4. Securely stream the request body to the external image hosting service.
  // This acts as a true proxy, avoiding re-parsing/re-creating FormData which can corrupt the file data.
  try {
    const uploadUrl = 'https://cdn.markjoker.top/api/v1/upload';

    const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${uploadToken}`,
            'Accept': 'application/json',
            // Pass the original Content-Type header directly.
            //'Content-Type': contentType, 
        },
        // Stream the body directly from the incoming request.
        body: externalFormData,
        // The 'duplex' property is required by fetch when streaming a request body.
        // @ts-ignore
        duplex: 'half',
    });

    // --- Robust Error Handling ---
    if (!response.ok) {
        let errorMessage = `Image host failed with status: ${response.status}`;
        const responseContentType = response.headers.get('content-type');

        try {
            if (responseContentType && responseContentType.includes('application/json')) {
                const errorResult = await response.json();
                errorMessage = errorResult.message || JSON.stringify(errorResult);
            } else {
                const errorText = await response.text();
                console.error('Image host returned a non-JSON error response:', errorText);
                // Handle the specific plain text error from the image server
                if (errorText.includes('Unsupported file type')) {
                    errorMessage = '不支持的文件类型';
                } else {
                    errorMessage = "图片托管服务返回了意外错误，请检查服务器日志。";
                }
            }
        } catch (e) {
            console.error('Could not parse error response from image host:', e);
            errorMessage = "解析图片托管服务的错误响应失败。";
        }
        throw new Error(errorMessage);
    }

    // --- Success Path ---
    const result = await response.json();

    if (result.status === false) {
        console.error('Image host returned a failed status:', result.message);
        throw new Error(result.message || "图片托管服务报告了一个失败。");
    }
    
    // 6. Extract the final URL and return it to the client
    if (result.data && result.data.links.url) {
        return NextResponse.json({ url: result.data.links.url });
    } else {
        console.error('Unexpected response format from image host:', result);
        throw new Error("在图片托管服务的响应中未找到图片 URL。");
    }

  } catch (error) {
    console.error("Server-side upload error:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 500 });
  }
}
