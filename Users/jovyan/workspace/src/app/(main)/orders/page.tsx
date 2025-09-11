
import { getOrdersByUserId } from '@/lib/data-service';
import { OrdersClientPage } from './client-page';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SessionData } from '@/lib/session';

export const dynamic = 'force-dynamic';

// This is now a Server Component
export default async function OrdersPage() {
  const session = await getIronSession<SessionData>(cookies(), {
    password: process.env.AUTHING_SECRET!,
    cookieName: 'suitopia-session',
  });

  const userId = session.uid;
  let ordersData = [];

  if (userId) {
    ordersData = await getOrdersByUserId(userId);
  }

  // We pass the fetched data to the client component.
  // The client component is now only responsible for rendering.
  return <OrdersClientPage initialOrders={ordersData} />;
}
