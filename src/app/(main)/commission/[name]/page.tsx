
'use client';
import { notFound, useParams } from 'next/navigation';
import { getCommissionOptionByName, getCommissionStylesByOptionId } from '@/lib/data-service';
import { CommissionStylePageClient } from './client-page';
import { useState, useEffect } from 'react';
import type { CommissionOption, CommissionStyle } from '@/types';

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
    async function fetchData() {
      setLoading(true);
      const option = await getCommissionOptionByName(commissionName);
      if (!option) {
        notFound();
        return;
      }
      const stylesData = await getCommissionStylesByOptionId(option.id);
      setCommissionOption(option);
      setStyles(stylesData);
      setLoading(false);
    }
    fetchData();
  }, [commissionName]);


  if (loading) {
    return null; // Or a skeleton loader
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
