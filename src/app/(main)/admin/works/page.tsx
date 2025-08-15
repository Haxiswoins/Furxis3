import { getWorks } from '@/lib/data-service';
import { AdminWorksClient } from './client-page';

export default async function AdminWorksPage() {
  const works = await getWorks();

  return (
    <AdminWorksClient works={works} />
  );
}
