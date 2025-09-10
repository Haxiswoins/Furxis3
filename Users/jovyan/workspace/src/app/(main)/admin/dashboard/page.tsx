

import { getCharacters, getCommissionOptions, getAllOrders, getWorks } from '@/lib/data-service';
import { AdminDashboardClient } from './client-page';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    const [charactersData, commissionOptionsData, ordersData, worksData] = await Promise.all([
        getCharacters(),
        getCommissionOptions(),
        getAllOrders(),
        getWorks()
    ]);
    return (
        <AdminDashboardClient 
            characters={charactersData}
            commissionOptions={commissionOptionsData}
            orders={ordersData}
            works={worksData}
        />
    );
}
