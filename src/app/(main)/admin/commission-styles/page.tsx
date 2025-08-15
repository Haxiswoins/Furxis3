import { getAllCommissionStyles, getCommissionOptions } from '@/lib/data-service';
import { AdminCommissionStylesClient } from './client-page';

export default async function AdminCommissionStylesPage() {
  const [styles, options] = await Promise.all([
    getAllCommissionStyles(),
    getCommissionOptions(),
  ]);

  return (
    <AdminCommissionStylesClient styles={styles} options={options} />
  );
}
