
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { SessionData } from '@/lib/session';

export async function GET() {
  // --- Temporary Testing Override ---
  // This is a temporary modification to facilitate testing.
  // It forces the current user to be recognized as an admin.
  // This should be reverted before going to production.
  return NextResponse.json({
    user: {
      uid: 'admin-test-override',
      email: 'haxiswoins@qq.com',
      name: '测试管理员',
      picture: null,
      isAdmin: true,
    },
  });

  /*
  // Original Code
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
  */
}
