
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { SessionData } from '@/lib/session';

export async function GET() {
  // --- PRODUCTION CODE ---
  // This is the secure way to handle user sessions.
  const session = await getIronSession<SessionData>(cookies(), {
    password: process.env.AUTHING_SECRET!,
    cookieName: 'suitopia-session',
  });

  if (!session.isLoggedIn) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      uid: session.uid,
      email: session.email,
      name: session.name,
      picture: session.picture,
      isAdmin: session.isAdmin,
    },
  });
}
