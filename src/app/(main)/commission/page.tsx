'use client';

import { getCommissionOptions, getSiteContent } from '@/lib/data-service';
import { CommissionClientPage } from './client-page';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { CommissionOption, SiteContent } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

function CommissionPageSkeleton() {
  return (
    <div>
      <div className="text-center mb-12">
        <Skeleton className="h-10 w-40 mx-auto" />
        <Skeleton className="h-6 w-96 mx-auto mt-4" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="relative aspect-[3/5] rounded-xl overflow-hidden bg-muted">
            <Skeleton className="w-full h-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CommissionPage() {
  const [options, setOptions] = useState<CommissionOption[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getCommissionOptions(),
      getSiteContent(),
    ]).then(([fetchedOptions, siteContent]) => {
      const sortedOptions = fetchedOptions.sort((a, b) => {
        const timeA = parseInt(a.id.split('_')[1] || '0');
        const timeB = parseInt(b.id.split('_')[1] || '0');
        return timeB - timeA;
      });
      setOptions(sortedOptions);
      setContent(siteContent);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <CommissionPageSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline">委托申请</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {content?.commissionPageDescription || '选择一个基础套餐开始您的定制兽装之旅。'}
        </p>
      </div>
      <CommissionClientPage commissionOptions={options} />
    </motion.div>
  );
}
