
import { getCommissionOptions } from '@/lib/data-service';
import { AdminCommissionsClient } from './client-page';
import type { CommissionOption } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminCommissionsPage() {
  const commissionOptions: CommissionOption[] = await getCommissionOptions();
  return <AdminCommissionsClient commissionOptions={commissionOptions} />;
}
