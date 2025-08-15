
import { NextResponse } from 'next/server';
import { getSiteContent } from '@/lib/data-service';

export async function GET() {
  try {
    const siteContent = await getSiteContent();
    return NextResponse.json(siteContent);
  } catch (error) {
    console.error('Failed to get site content:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
