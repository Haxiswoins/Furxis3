import { cleanupBadgeQRCodes } from '@/ai/flows/cleanup-qrcodes-flow';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const result = await cleanupBadgeQRCodes();
    return NextResponse.json({ success: true, message: result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error running cleanupBadgeQRCodes function:', errorMessage);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
