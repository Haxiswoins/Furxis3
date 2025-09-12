

import { getCommissionOptions } from '@/lib/data-service';
import { AdminCommissionsClient } from '@/app/(main)/admin/commissions/client-page';

export const dynamic = 'force-dynamic';

export default async function AdminCommissionsPage() {
  const data = await getCommissionOptions();
  return <AdminCommissionsClient commissionOptions={data} />;
}
