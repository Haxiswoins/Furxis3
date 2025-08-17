'use client';

import { notFound, useParams } from 'next/navigation';
import { getCharactersBySeriesId, getCharacterSeriesByName } from '@/lib/data-service';
import { CharacterListPageClient } from './client-page';
import { Character, CharacterSeries } from '@/types';
import { useEffect, useState, useCallback } from 'react';

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
    return null; // Or a skeleton loader
  }

  if (!series) {
    notFound();
    return null;
  }

  return (
    <CharacterListPageClient series={series} characters={characters} />
  );
}
