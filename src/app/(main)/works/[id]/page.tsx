
'use client';
import { notFound, useParams } from 'next/navigation';
import { getWorkById } from '@/lib/data-service';
import { WorkDetailPageClient } from './client-page';
import { useState, useEffect } from 'react';
import type { Work } from '@/types';

export default function WorkDetailPage() {
  const params = useParams();
  const workId = params.id as string;
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workId) {
      notFound();
      return;
    }
    async function fetchData() {
      const workData = await getWorkById(workId);
      if (!workData) {
        notFound();
      } else {
        setWork(workData);
      }
      setLoading(false);
    }
    fetchData();
  }, [workId]);


  if (loading) {
    return null; // Or a skeleton loader
  }

  if (!work) {
    notFound();
    return null;
  }

  return (
    <WorkDetailPageClient work={work} />
  );
}
