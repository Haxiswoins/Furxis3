
import { notFound } from 'next/navigation';
import { getCharactersBySeriesId, getCharacterSeriesByName } from '@/lib/data-service';
import { CharacterListPageClient } from './client-page';
import { Character, CharacterSeries } from '@/types';

export default async function AdoptionCharacterListPage({ params }: { params: { name: string } }) {
  const seriesName = decodeURIComponent(params.name as string);

  if (!seriesName) {
    notFound();
  }
  
  const series: CharacterSeries | null = await getCharacterSeriesByName(seriesName);

  if (!series) {
      notFound();
  }
  
  const characters: Character[] = await getCharactersBySeriesId(series.id);

  return (
    <CharacterListPageClient series={series} characters={characters} />
  );
}
