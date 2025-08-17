'use client';
import { notFound, useParams } from 'next/navigation';
import { getWorkById } from '@/lib/data-service';
import { WorkDetailPageClient } from './client-page';
import { useState, useEffect, useCallback } from 'react';
import type { Work } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function WorkDetailPage() {
  const params = useParams();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);

  const workId = params.id as string;

  const fetchData = useCallback(async () => {
    if (!workId) {
      notFound();
      return;
    }
    setLoading(true);
    try {
      const workData = await getWorkById(workId);
      if (!workData) {
        notFound();
      } else {
        setWork(workData);
      }
    } catch (error) {
      console.error("Failed to fetch work data:", error);
      notFound();
    } finally {
      setLoading(false);
    }
  }, [workId]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);


  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
            <Skeleton className="h-12 w-1/2 mx-auto" />
            <Skeleton className="h-6 w-1/3 mx-auto" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           {[...Array(4)].map((_, i) => (
             <Skeleton key={i} className="aspect-video w-full rounded-lg" />
           ))}
        </div>
      </div>
    );
  }

  if (!work) {
    notFound();
    return null;
  }

  return (
    <WorkDetailPageClient work={work} />
  );
}
