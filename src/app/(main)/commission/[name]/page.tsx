'use client';
import { notFound, useParams } from 'next/navigation';
import { getCommissionOptionByName, getCommissionStylesByOptionId } from '@/lib/data-service';
import { CommissionStylePageClient } from './client-page';
import { useState, useEffect, useCallback } from 'react';
import type { CommissionOption, CommissionStyle } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommissionStylePage() {
  const params = useParams();
  const [commissionOption, setCommissionOption] = useState<CommissionOption | null>(null);
  const [styles, setStyles] = useState<CommissionStyle[]>([]);
  const [loading, setLoading] = useState(true);

  const commissionName = decodeURIComponent(params.name as string);

  const fetchData = useCallback(async () => {
    if (!commissionName) {
      notFound();
      return;
    }
    setLoading(true);
    try {
      const option = await getCommissionOptionByName(commissionName);
      if (!option) {
        notFound();
        return;
      }
      const stylesData = await getCommissionStylesByOptionId(option.id);
      setCommissionOption(option);
      setStyles(stylesData);
    } catch (error) {
      console.error("Failed to fetch commission data:", error);
      notFound();
    } finally {
      setLoading(false);
    }
  }, [commissionName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  if (loading) {
    return (
        <div>
            <div className="text-center mb-12">
                <Skeleton className="h-10 w-1/3 mx-auto" />
                <Skeleton className="h-6 w-2/3 mx-auto mt-4" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        </div>
    )
  }

  if (!commissionOption) {
      notFound();
      return null;
  }

  return (
    <CommissionStylePageClient 
      styles={styles} 
      commissionOption={commissionOption} 
      commissionName={commissionName} 
    />
  );
}

function CardSkeleton() {
    return (
        <div className="space-y-4 p-4 border rounded-lg">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between items-center pt-4">
                <Skeleton className="h-7 w-1/4" />
                <Skeleton className="h-9 w-1/3" />
            </div>
        </div>
    )
}
