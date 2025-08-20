
import { NextResponse } from "next/server";

// The @authing/nextjs dependency is currently broken, causing installation and build failures.
// This route handler is a temporary measure to prevent the app from crashing when auth routes are accessed.
// It redirects the user to a more user-friendly page instead of showing a JSON error.
export async function GET() {
    const loginUrl = new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    return NextResponse.redirect(loginUrl);
}
