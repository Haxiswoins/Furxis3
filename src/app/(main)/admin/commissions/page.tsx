import { getCommissionOptions } from '@/lib/data-service';
import { AdminCommissionsClient } from './client-page';

export default async function AdminCommissionsPage() {
  const commissionOptions = await getCommissionOptions();
  
  return (
    <AdminCommissionsClient commissionOptions={commissionOptions} />
  );
}
