

import { getAllOrders } from '@/lib/data-service';
import { AdminOrdersClient } from './client-page';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
    const allOrders = await getAllOrders();
    return <AdminOrdersClient allOrders={allOrders} />;
}

