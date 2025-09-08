
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import type { SessionData } from '@/lib/session';


export function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const action = req.nextUrl.pathname.split('/').pop();
    const returnTo = searchParams.get('returnTo');

    const issuer = process.env.AUTHING_ISSUER;
    if (!issuer) {
        console.error("AUTHING_ISSUER environment variable is not set.");
        return NextResponse.json({ error: "Authentication provider is not configured." }, { status: 500 });
    }

    if (action === 'login') {
        // Corrected to use the standard OAuth2.0 authorization endpoint
        const loginUrl = new URL(`${issuer}/oauth/auth`);
        
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
