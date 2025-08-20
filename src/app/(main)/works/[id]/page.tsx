
import { notFound } from 'next/navigation';
import { getWorkById } from '@/lib/data-service';
import { WorkDetailPageClient } from './client-page';
import type { Work } from '@/types';

export const dynamic = 'force-dynamic';

export default async function WorkDetailPage({ params }: { params: { id: string }}) {
  const workId = params.id as string;
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
