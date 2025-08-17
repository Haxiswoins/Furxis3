
'use client';

import { notFound, useParams } from 'next/navigation';
import { getCharactersBySeriesId, getCharacterSeriesByName } from '@/lib/data-service';
import { CharacterListPageClient } from './client-page';
import { Character, CharacterSeries } from '@/types';
import { useEffect, useState } from 'react';

export default function AdoptionCharacterListPage() {
  const params = useParams();
  const seriesName = decodeURIComponent(params.name as string);

  const [series, setSeries] = useState<CharacterSeries | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!seriesName) {
      notFound();
      return;
    }

    async function fetchData() {
      setLoading(true);
      const seriesData = await getCharacterSeriesByName(seriesName);
      if (!seriesData) {
        notFound();
        return;
      }
      
      const charactersData = await getCharactersBySeriesId(seriesData.id);
      setSeries(seriesData);
      setCharacters(charactersData);
      setLoading(false);
    }

    fetchData();

  }, [seriesName]);


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
