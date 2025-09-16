
import { getAllOrders } from '@/lib/data-service';
import { AdminOrdersClient } from './client-page';

export default async function AdminOrdersPage() {
  const allOrders = await getAllOrders();
  return <AdminOrdersClient orders={allOrders} />;
}

    