
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
      const [optionsData, contentData] = await Promise.all([
        getCommissionOptions(),
        getSiteContent(),
      ]);

      const sortedOptions = optionsData.sort((a, b) => {
        const timeA = parseInt(a.id.split('_')[1] || '0');
        const timeB = parseInt(b.id.split('_')[1] || '0');
        return timeB - timeA;
      });
      
      setOptions(sortedOptions);
      setContent(contentData);
      setLoading(false);
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
