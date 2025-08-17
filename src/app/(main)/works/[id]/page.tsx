'use client';

import { notFound, useParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { getWorkById } from '@/lib/data-service';
import { WorkImages } from './client-page';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Work } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

function WorkDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <Skeleton className="h-14 w-1/2 mx-auto" />
        <Skeleton className="h-5 w-1/3 mx-auto" />
        <div className="max-w-3xl mx-auto pt-2 space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="aspect-video" />
        <Skeleton className="aspect-video" />
      </div>
    </div>
  )
}

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
    setLoading(true);
    getWorkById(workId).then(data => {
      if (!data) {
        notFound();
      } else {
        setWork(data);
        setLoading(false);
      }
    });
  }, [workId]);
  
  if (loading) {
    return <WorkDetailSkeleton />
  }

  if (!work) {
    notFound();
    return null;
  }

  return (
    <motion.div 
        className="max-w-6xl mx-auto space-y-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-headline font-bold">{work.workName}</h1>
        <p className="text-muted-foreground">
          委托人: {work.clientName} | 完成于: {new Date(work.completionDate).toLocaleDateString()}
        </p>
        {work.description && (
            <p className="text-lg text-foreground/80 max-w-3xl mx-auto pt-2">
                {work.description}
            </p>
        )}
      </div>

      <Separator />

      <WorkImages work={work} />
    </motion.div>
  );
}
