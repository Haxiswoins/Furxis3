
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
        // 1. Sanitize the path to prevent traversal attacks.
        // The path should not contain '..' to move up directories.
        const pathParts = subfolder.split(/[\\/]/);
        if (pathParts.some(part => part === '..')) {
            return NextResponse.json({ message: "Invalid path specified (directory traversal detected)." }, { status: 400 });
        }
        
        // 2. Check if the root of the subfolder is in the whitelist
        const rootFolder = pathParts[0];
        if (!ALLOWED_SUBFOLDERS.includes(rootFolder)) {
            return NextResponse.json({ message: "Invalid upload path specified (not in whitelist)." }, { status: 400 });
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
