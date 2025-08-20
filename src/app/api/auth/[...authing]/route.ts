
import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const returnTo = searchParams.get('returnTo');
    
    // The AUTHING_ISSUER should be the base URL for the OIDC provider
    const issuer = process.env.AUTHING_ISSUER;
    if (!issuer) {
        console.error("AUTHING_ISSUER environment variable is not set.");
        return NextResponse.json({ error: "Authentication provider is not configured." }, { status: 500 });
    }
    
    // Construct the login URL from the issuer
    let loginUrl = new URL(issuer + '/oidc/auth');
    
    const clientId = process.env.AUTHING_APP_ID;
    const redirectUri = process.env.AUTHING_REDIRECT_URI;

    if (clientId && redirectUri) {
        loginUrl.searchParams.set('client_id', clientId);
        loginUrl.searchParams.set('redirect_uri', redirectUri);
        loginUrl.searchParams.set('response_type', 'code');
        loginUrl.searchParams.set('scope', 'openid profile email phone');
        if (returnTo) {
            loginUrl.searchParams.set('state', Buffer.from(JSON.stringify({ returnTo })).toString('base64'));
        }
    } else {
        // Fallback to a simpler login page if config is missing
        console.error("Authing client ID or redirect URI is missing.");
        const fallbackLoginUrl = new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
        return NextResponse.redirect(fallbackLoginUrl);
    }
    
    return NextResponse.redirect(loginUrl);
}

export async function POST(req: NextRequest) {
  return GET(req);
}
