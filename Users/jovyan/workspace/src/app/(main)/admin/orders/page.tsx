
import { getAllOrders } from '@/lib/data-service';
import { AdminOrdersClient } from './client-page';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const allOrders = await getAllOrders();
  return <AdminOrdersClient orders={allOrders} />;
}
