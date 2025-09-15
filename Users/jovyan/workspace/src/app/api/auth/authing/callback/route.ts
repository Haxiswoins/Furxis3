import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import type { SessionData } from '@/lib/session';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  const issuer = process.env.AUTHING_ISSUER;
  if (!code || !issuer) {
    return NextResponse.json({ error: 'Authorization code or issuer is missing' }, { status: 400 });
  }

  try {
    // Exchange authorization code for tokens
    // Use the URL constructor to safely join paths, avoiding double slashes.
    const tokenUrl = new URL('/oidc/token', issuer);
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.AUTHING_APP_ID!,
        client_secret: process.env.AUTHING_APP_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.AUTHING_REDIRECT_URI!,
      }),
    });

    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok) {
      console.error('Failed to fetch tokens:', tokens);
      throw new Error(tokens.error_description || 'Failed to fetch tokens');
    }

    // Fetch user info with the access token
    // Use the URL constructor to safely join paths.
    const userInfoUrl = new URL('/oidc/me', issuer);
    const userInfoResponse = await fetch(userInfoUrl, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    
    const userInfo = await userInfoResponse.json();
     if (!userInfoResponse.ok) {
      console.error('Failed to fetch user info:', userInfo);
      throw new Error(userInfo.error_description || 'Failed to fetch user info');
    }

    const session = await getIronSession<SessionData>(cookies(), {
      password: process.env.AUTHING_SECRET!,
      cookieName: 'suitopia-session',
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      },
    });

    session.isLoggedIn = true;
    session.uid = userInfo.sub;
    session.email = userInfo.email;
    session.name = userInfo.name || userInfo.preferred_username;
    session.picture = userInfo.picture;
    session.isAdmin = userInfo.email === process.env.ADMIN_EMAIL;

    await session.save();

    let returnTo = '/home';
    if (state) {
        try {
            const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
            if(decodedState.returnTo) {
                returnTo = decodedState.returnTo;
            }
        } catch(e) {
            console.error("Failed to parse state:", e);
        }
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
    const redirectUrl = new URL(returnTo, baseUrl);

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Authentication callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMessage)}`, req.url));
  }
}
