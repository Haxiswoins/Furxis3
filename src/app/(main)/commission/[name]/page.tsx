'use client';
import { notFound, useParams } from 'next/navigation';
import { getCommissionOptionByName, getCommissionStylesByOptionId } from '@/lib/data-service';
import { CommissionStylePageClient } from './client-page';
import { useState, useEffect, useCallback } from 'react';
import type { CommissionOption, CommissionStyle } from '@/types';

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
