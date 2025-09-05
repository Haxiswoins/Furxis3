
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { SessionData } from '@/lib/session';

export async function GET() {
  
  // --- TEMPORARY ADMIN MODE ---
  // This will make the application behave as if an admin is always logged in.
  // Remember to revert this change before going to production.
  
  const adminUser = {
    user: {
      uid: 'admin_test_user_001',
      email: process.env.ADMIN_EMAIL || 'admin@suitopia.club',
      name: 'Suitopia Admin (Test)',
      picture: null,
      isAdmin: true,
    },
  };
  return NextResponse.json(adminUser);
  
  /*
  // --- ORIGINAL CODE ---
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

