

import { getWorks } from '@/lib/data-service';
import { AdminWorksClient } from '@/app/(main)/admin/works/client-page';

export const dynamic = 'force-dynamic';

export default async function AdminWorksPage() {
  const data = await getWorks();
  return <AdminWorksClient works={data} />;
}
