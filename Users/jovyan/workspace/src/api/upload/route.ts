
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

  // 3. Get the Content-Type from the original request.
  // This is CRITICAL for the external server to understand the multipart/form-data payload,
  // as it includes the boundary definition.
  const contentType = req.headers.get('content-type');
  if (!contentType) {
      return NextResponse.json({ error: 'Content-Type header is missing from the upload request.' }, { status: 400 });
  }

  // 4. Securely stream the request body to the external image hosting service.
  // This acts as a true proxy, avoiding re-parsing/re-creating FormData, which is more efficient
  // and prevents data corruption, especially for large files.
  try {
    const uploadUrl = `https://${uploadHost}/api/v1/upload`;

    const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            // Pass the bearer token for authorization.
            'Authorization': `Bearer ${uploadToken}`,
            // We're expecting a JSON response.
            'Accept': 'application/json',
            // Pass the original Content-Type header directly. This is the key fix.
            'Content-Type': contentType, 
        },
        // Stream the body directly from the incoming Next.js request.
        body: req.body,
        // The 'duplex' property is required by fetch when streaming a request body.
        // @ts-ignore
        duplex: 'half',
    });

    // --- Robust Error Handling ---
    if (!response.ok) {
        let errorMessage = `Image host failed with status: ${response.status}`;
        try {
            // Attempt to parse a JSON error response first.
            const errorResult = await response.json();
            errorMessage = errorResult.message || JSON.stringify(errorResult);
        } catch (e) {
            // If the error response isn't JSON, read it as text.
            const errorText = await response.text();
            console.error('Image host returned a non-JSON error response:', errorText);
            // Handle the specific plain text error from this particular image server.
            if (errorText.includes('Unsupported file type')) {
                errorMessage = '不支持的文件类型';
            } else {
                errorMessage = "图片托管服务返回了意外错误，请检查服务器日志。";
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
    if (result.data && result.data.url) {
        return NextResponse.json({ url: result.data.url });
    } else {
        console.error('Unexpected success response format from image host:', result);
        throw new Error("在图片托管服务的响应中未找到图片 URL。");
    }

  } catch (error) {
    console.error("Server-side upload proxy error:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred during the server-side upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
