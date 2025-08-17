'use client';
import { getCharacterSeries, getSiteContent } from '@/lib/data-service';
import { AdoptionSeriesClientPage } from './client-page';
import type { CharacterSeries, SiteContent } from '@/types';
import { useEffect, useState } from 'react';


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
    return null; // Or a skeleton loader
  }

  return (
    <AdoptionSeriesClientPage seriesData={seriesData} content={content} />
  );
}
