
// import { handleAuth } from '@authing/nextjs';

import { NextResponse } from "next/server";

// export const GET = handleAuth();

// Temporarily disable the route to avoid errors
export async function GET() {
    return NextResponse.json({ error: "Authentication is temporarily disabled." }, { status: 503 });
}
