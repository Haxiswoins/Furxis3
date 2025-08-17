'use client';
import { getWorks } from '@/lib/data-service';
import type { Work } from '@/types';
import { WorksPageClient } from './client-page';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function WorksPage() {
  const [worksByYear, setWorksByYear] = useState<Record<string, Work[]>>({});
  const [sortedYears, setSortedYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
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
      } catch (error) {
        console.error("Failed to fetch works:", error);
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
             <div className="space-y-12">
                {[...Array(2)].map((_, i) => (
                    <div key={i}>
                        <Skeleton className="h-8 w-24 mb-6" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {[...Array(5)].map((_, j) => (
                               <div key={j} className="space-y-2">
                                    <Skeleton className="aspect-[3/4] w-full" />
                                    <Skeleton className="h-5 w-2/3" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <WorksPageClient worksByYear={worksByYear} sortedYears={sortedYears} />
  );
}
