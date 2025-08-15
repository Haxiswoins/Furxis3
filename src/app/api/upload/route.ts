
import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { randomUUID } from 'crypto';

// Check if the service account key is available in environment variables
const serviceAccountKeyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

// Initialize Firebase Admin SDK only if it hasn't been already
if (!getApps().length) {
    if (!serviceAccountKeyString) {
        // This log is for the server console
        console.error('CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
    } else {
        try {
            initializeApp({
                credential: cert(JSON.parse(serviceAccountKeyString)),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
            });
        } catch (e) {
            console.error('CRITICAL: Failed to initialize Firebase Admin SDK. The service account key might be invalid.', e);
        }
    }
}


export async function POST(req: Request) {
  // Gracefully handle cases where the Admin SDK failed to initialize
  if (!getApps().length) {
    return NextResponse.json({ message: "Upload failed: Server is not configured for file uploads." }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const path = formData.get('path') as string | null; // Optional path from client

    if (!file) {
      return NextResponse.json({ message: "No file found in request." }, { status: 400 });
    }

    const bucket = getStorage().bucket();
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Generate a unique filename using a UUID to avoid collisions
    const uniqueFilename = `${randomUUID()}-${file.name}`;
    const destination = path ? `${path}/${uniqueFilename}` : `uploads/${uniqueFilename}`;
    
    const fileUpload = bucket.file(destination);

    await fileUpload.save(fileBuffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Make the file publicly accessible
    await fileUpload.makePublic();

    // Get the public URL
    const publicUrl = fileUpload.publicUrl();

    return NextResponse.json({ url: publicUrl }, { status: 200 });

  } catch (error) {
    console.error('Upload API Error:', error);
    // It's good practice to check the error type
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ message: `Upload failed: ${errorMessage}` }, { status: 500 });
  }
}
