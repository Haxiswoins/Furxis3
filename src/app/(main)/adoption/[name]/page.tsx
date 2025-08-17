'use client';

import { notFound, useParams } from 'next/navigation';
import { getCharactersBySeriesId, getCharacterSeriesByName } from '@/lib/data-service';
import { CharacterListPageClient } from './client-page';
import { Character, CharacterSeries } from '@/types';
import { useEffect, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdoptionCharacterListPage() {
  const params = useParams();
  const [series, setSeries] = useState<CharacterSeries | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  const seriesName = decodeURIComponent(params.name as string);
  
  const fetchData = useCallback(async () => {
    if (!seriesName) {
      notFound();
      return;
    }

    setLoading(true);
    try {
      const seriesData = await getCharacterSeriesByName(seriesName);
      if (!seriesData) {
        notFound();
        return;
      }
      
      const charactersData = await getCharactersBySeriesId(seriesData.id);
      setSeries(seriesData);
      setCharacters(charactersData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      notFound();
    } finally {
      setLoading(false);
    }
  }, [seriesName]);

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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="aspect-[3/4] w-full" />
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-5 w-1/3" />
                    </div>
                ))}
            </div>
        </div>
    )
  }

  if (!series) {
    notFound();
    return null;
  }

  return (
    <CharacterListPageClient series={series} characters={characters} />
  );
}
