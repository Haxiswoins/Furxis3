import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  if (!adminAuth) {
    return NextResponse.json(
      { error: 'Firebase Admin not initialized.' },
      { status: 500 }
    );
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const userRecord = await adminAuth.createUser({
      email,
      password,
    });

    return NextResponse.json({ uid: userRecord.uid, email: userRecord.email });
  } catch (error: any) {
    let errorMessage = 'An unknown error occurred.';
    let statusCode = 500;

    switch (error.code) {
      case 'auth/email-already-exists':
        errorMessage = 'This email address is already in use by another account.';
        statusCode = 409; // Conflict
        break;
      case 'auth/invalid-password':
        errorMessage = 'The specified password is not valid. It must be a string with at least six characters.';
        statusCode = 400;
        break;
       case 'auth/invalid-email':
        errorMessage = 'The specified email is not valid.';
        statusCode = 400;
        break;
      default:
        // Log the unexpected error on the server
        console.error('Firebase Admin SDK error:', error);
        break;
    }
    
    return NextResponse.json({ error: errorMessage, code: error.code }, { status: statusCode });
  }
}
