
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { mkdir } from 'fs/promises';

// Define a whitelist of allowed subfolders for uploads
const ALLOWED_SUBFOLDERS = [
    'characters', 
    'series', 
    'commission-styles',
    'commissions',
    'works',
    'site',
    'references'
];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const subfolder = formData.get('path') as string | null; 

    if (!file) {
      return NextResponse.json({ message: "No file found in request." }, { status: 400 });
    }

    // --- SECURITY ENHANCEMENT: Path Validation ---
    if (subfolder) {
        // 1. Check if the subfolder is in the whitelist
        const mainFolder = subfolder.split('/')[0]; // e.g., 'characters' from 'characters/stardust_...'
        if (!ALLOWED_SUBFOLDERS.includes(mainFolder)) {
            return NextResponse.json({ message: "Invalid upload path specified." }, { status: 400 });
        }
        // 2. Prevent any directory traversal characters
        if (subfolder.includes('..') || subfolder.includes('/')) {
            return NextResponse.json({ message: "Invalid characters in path." }, { status: 400 });
        }
    }
    // --- END SECURITY ENHANCEMENT ---

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Generate a unique filename using a UUID to avoid collisions
    const uniqueFilename = `${randomUUID()}-${file.name}`;
    
    // Determine the upload directory, ensuring it's within 'public/uploads'
    const uploadsRoot = join(process.cwd(), 'public', 'uploads');
    const uploadDir = subfolder ? join(uploadsRoot, subfolder) : uploadsRoot;
    
    // Create the directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    const destination = join(uploadDir, uniqueFilename);
    
    // Write the file to the local filesystem
    await writeFile(destination, fileBuffer);
    
    // Construct the public URL
    const publicUrl = subfolder ? `/uploads/${subfolder}/${uniqueFilename}` : `/uploads/${uniqueFilename}`;

    return NextResponse.json({ url: publicUrl }, { status: 200 });

  } catch (error) {
    console.error('Upload API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ message: `Upload failed: ${errorMessage}` }, { status: 500 });
  }
}
