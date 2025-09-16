
import { getAllCommissionStyles, getCommissionOptions } from '@/lib/data-service';
import { AdminCommissionStylesClient } from './client-page';

export default async function AdminCommissionStylesPage() {
  const [stylesData, optionsData] = await Promise.all([
    getAllCommissionStyles(),
    getCommissionOptions(),
  ]);

  return <AdminCommissionStylesClient styles={stylesData} options={optionsData} />;
}

    