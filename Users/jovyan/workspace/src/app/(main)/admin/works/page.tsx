
import { getWorks } from '@/lib/data-service';
import { AdminWorksClient } from './client-page';
import type { Work } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminWorksPage() {
  const worksData: Work[] = await getWorks();
  return <AdminWorksClient works={worksData} />;
}
