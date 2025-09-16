
import { getAllOrders } from '@/lib/data-service';
import { AdminOrdersClient } from './client-page';
import type { Order } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const allOrders: Order[] = await getAllOrders();
  return <AdminOrdersClient orders={allOrders} />;
}
