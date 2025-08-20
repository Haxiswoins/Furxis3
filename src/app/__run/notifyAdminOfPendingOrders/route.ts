
import { notifyAdminOfPendingOrders } from '@/ai/flows/pending-orders-notification-flow';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const result = await notifyAdminOfPendingOrders();
    return NextResponse.json({ success: true, message: result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error running notifyAdminOfPendingOrders function:', errorMessage);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
