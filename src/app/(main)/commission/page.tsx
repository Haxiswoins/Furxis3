'use client';
import { getCommissionOptions, getSiteContent } from '@/lib/data-service';
import { CommissionPageClient } from './page-client';
import type { CommissionOption, SiteContent } from '@/types';
import { useState, useEffect } from 'react';

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
        
        setOptions(optionsData); // The sorting is now done in data-service
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
    return null; // Or a skeleton loader
  }

  return (
    <CommissionPageClient options={options} content={content} />
  );
}
