'use server';

import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const action = req.nextUrl.pathname.split('/').pop();
    const returnTo = searchParams.get('returnTo');

    const authEndpoint = process.env.AUTHING_AUTH_ENDPOINT;
    if (!authEndpoint) {
        console.error("AUTHING_AUTH_ENDPOINT environment variable is not set.");
        return NextResponse.json({ error: "Authentication provider is not configured." }, { status: 500 });
    }

    if (action === 'login') {
        const loginUrl = new URL(authEndpoint);
        
        const clientId = process.env.AUTHING_APP_ID;
        const redirectUri = process.env.AUTHING_REDIRECT_URI;

        if (clientId && redirectUri) {
            loginUrl.searchParams.set('client_id', clientId);
            loginUrl.searchParams.set('redirect_uri', redirectUri);
            loginUrl.searchParams.set('response_type', 'code');
            loginUrl.searchParams.set('scope', 'openid profile email phone');
            loginUrl.searchParams.set('prompt', 'login');
            
            if (returnTo) {
                loginUrl.searchParams.set('state', Buffer.from(JSON.stringify({ returnTo })).toString('base64'));
            }
        } else {
            console.error("Authing client ID or redirect URI is missing.");
            return NextResponse.redirect(new URL('/login', req.url));
        }
        
        return NextResponse.redirect(loginUrl);
    }
    
    // The logout logic is now handled exclusively by /api/auth/logout.
    // Any other action passed to this dynamic route is considered a bad request.
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}


export async function POST(req: NextRequest) {
  return GET(req);
}
