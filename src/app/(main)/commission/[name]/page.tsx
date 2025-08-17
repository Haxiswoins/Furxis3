'use client';

import { notFound, useParams } from 'next/navigation';
import { getCommissionOptionByName, getCommissionStylesByOptionId } from '@/lib/data-service';
import { CommissionStyleClientPage } from './client-page';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { CommissionOption, CommissionStyle } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';


function StylePageSkeleton() {
  return (
    <div>
      <div className="text-center mb-12">
        <Skeleton className="h-10 w-48 mx-auto" />
        <Skeleton className="h-6 w-80 mx-auto mt-4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
           <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm">
             <div className="p-4 space-y-3">
               <Skeleton className="h-6 w-3/4" />
               <Skeleton className="h-10 w-full" />
               <Skeleton className="h-5 w-1/3" />
             </div>
             <div className="flex items-center p-4 bg-muted/50 justify-between">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-9 w-28" />
             </div>
           </div>
        ))}
      </div>
    </div>
  )
}

export default function CommissionStylePage() {
  const params = useParams();
  const commissionName = decodeURIComponent(params.name as string);
  const [commissionOption, setCommissionOption] = useState<CommissionOption | null>(null);
  const [styles, setStyles] = useState<CommissionStyle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!commissionName) {
      notFound();
      return;
    }
    setLoading(true);
    getCommissionOptionByName(commissionName).then(option => {
      if (!option) {
        notFound();
        return;
      }
      setCommissionOption(option);
      getCommissionStylesByOptionId(option.id).then(styleData => {
        setStyles(styleData);
        setLoading(false);
      });
    });
  }, [commissionName]);


  if (loading || !commissionOption) {
    return <StylePageSkeleton />;
  }
  
  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline">样式选择</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {`请为 “${commissionOption.name}” 选择您感兴趣的具体样式`}
        </p>
      </div>

      <CommissionStyleClientPage 
        styles={styles} 
        commissionOption={commissionOption} 
        commissionName={commissionName} 
      />
    </motion.div>
  );
}
