'use client';
import { getCharacterSeries, getSiteContent } from '@/lib/data-service';
import { AdoptionSeriesClientPage } from './client-page';
import type { CharacterSeries, SiteContent } from '@/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


export default function AdoptionSeriesPage() {
  const [seriesData, setSeriesData] = useState<CharacterSeries[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [series, siteContent] = await Promise.all([
          getCharacterSeries(),
          getSiteContent(),
        ]);
        setSeriesData(series);
        setContent(siteContent);
      } catch (error) {
          console.error("Failed to fetch data for adoption series page", error);
      } finally {
          setLoading(false);
      }
    }
    fetchData();
  }, []);

  if(loading) {
    return (
        <div>
            <div className="text-center mb-12">
                <Skeleton className="h-10 w-1/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
                ))}
            </div>
        </div>
    )
  }

  return (
    <AdoptionSeriesClientPage seriesData={seriesData} content={content} />
  );
}
