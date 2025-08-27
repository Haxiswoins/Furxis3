
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { SessionData } from '@/lib/session';

export async function GET() {
  /* --- Admin Test Mode ---
  // This is a temporary modification to simulate an admin login for testing purposes.
  // It bypasses the actual session check and returns a hardcoded admin user.
  const adminUser = {
    uid: 'admin-test-uid',
    email: 'admin-test@example.com',
    name: '测试管理员',
    picture: 'https://placehold.co/100x100.png',
    isAdmin: true,
  };

  return NextResponse.json({ user: adminUser });
  */

  // --- Original Code ---
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
