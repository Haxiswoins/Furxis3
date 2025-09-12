

import { getCharacters, getCommissionOptions, getAllOrders, getWorks } from '@/lib/data-service';
import { AdminDashboardClient } from '@/app/(main)/admin/dashboard/client-page';

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
