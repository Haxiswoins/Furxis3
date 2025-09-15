
import { getCharacters, getCommissionOptions, getAllOrders, getWorks } from '@/lib/data-service';
import { AdminDashboardClient } from './client-page';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    const [characters, commissionOptions, orders, works] = await Promise.all([
        getCharacters(),
        getCommissionOptions(),
        getAllOrders(),
        getWorks()
    ]);
    
    return (
        <AdminDashboardClient
            characters={characters}
            commissionOptions={commissionOptions}
            orders={orders}
            works={works}
        />
    );
}
