import { notFound } from 'next/navigation';
import { getWorkById } from '@/lib/data-service';
import { WorkDetailPageClient } from './client-page';

export default async function WorkDetailPage({ params }: { params: { id: string } }) {
  const workId = params.id;

  if (!workId) {
    notFound();
  }

  const work = await getWorkById(workId);
  
  if (!work) {
    notFound();
  }

  return (
    <WorkDetailPageClient work={work} />
  );
}
