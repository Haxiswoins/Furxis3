'use client';
import { getCommissionOptions, getSiteContent } from '@/lib/data-service';
import { CommissionPageClient } from './page-client';
import type { CommissionOption, SiteContent } from '@/types';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommissionPage() {
  const [options, setOptions] = useState<CommissionOption[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [optionsData, contentData] = await Promise.all([
          getCommissionOptions(),
          getSiteContent(),
        ]);
        
        setOptions(optionsData);
        setContent(contentData);
      } catch (error) {
          console.error("Failed to fetch commission page data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
        <div>
            <div className="text-center mb-12">
                <Skeleton className="h-10 w-1/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="aspect-[3/5] w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
  }

  return (
    <CommissionPageClient options={options} content={content} />
  );
}
