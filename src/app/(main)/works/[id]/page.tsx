'use client';
import { notFound, useParams } from 'next/navigation';
import { getWorkById } from '@/lib/data-service';
import { WorkDetailPageClient } from './client-page';
import { useState, useEffect, useCallback } from 'react';
import type { Work } from '@/types';

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
