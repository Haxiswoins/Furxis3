
import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const returnTo = searchParams.get('returnTo');
    
    let loginUrl = new URL(process.env.AUTHING_ISSUER + '/login');
    
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
        const fallbackLoginUrl = new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
        return NextResponse.redirect(fallbackLoginUrl);
    }
    
    return NextResponse.redirect(loginUrl);
}

export async function POST(req: NextRequest) {
  return GET(req);
}
