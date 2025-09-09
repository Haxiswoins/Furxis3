

import { getAllCommissionStyles, getCommissionOptions } from '@/lib/data-service';
import { AdminCommissionStylesClient } from './client-page';

export const dynamic = 'force-dynamic';

export default async function AdminCommissionStylesPage() {
    const [stylesData, optionsData] = await Promise.all([
        getAllCommissionStyles(),
        getCommissionOptions(),
    ]);

    return <AdminCommissionStylesClient styles={stylesData} options={optionsData} />;
}
