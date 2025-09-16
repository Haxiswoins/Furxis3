
import { getWorks } from '@/lib/data-service';
import { AdminWorksClient } from './client-page';

export default async function AdminWorksPage() {
  const worksData = await getWorks();
  return <AdminWorksClient works={worksData} />;
}

    