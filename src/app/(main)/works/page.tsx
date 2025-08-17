
'use client';
import { getWorks } from '@/lib/data-service';
import type { Work } from '@/types';
import { WorksPageClient } from './client-page';
import { useEffect, useState } from 'react';

export default function WorksPage() {
  const [worksByYear, setWorksByYear] = useState<Record<string, Work[]>>({});
  const [sortedYears, setSortedYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const worksData = await getWorks();
      
      const groupedWorks = worksData.reduce((acc, work) => {
        const year = new Date(work.completionDate).getFullYear().toString();
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push(work);
        return acc;
      }, {} as Record<string, Work[]>);
      
      const years = Object.keys(groupedWorks).sort((a, b) => parseInt(b) - parseInt(a));

      setWorksByYear(groupedWorks);
      setSortedYears(years);
      setLoading(false);
    }
    fetchData();
  }, []);
  
  if (loading) {
    return null; // Or a skeleton loader
  }

  return (
    <WorksPageClient worksByYear={worksByYear} sortedYears={sortedYears} />
  );
}
