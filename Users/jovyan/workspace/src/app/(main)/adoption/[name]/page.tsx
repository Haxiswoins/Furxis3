
import { notFound } from 'next/navigation';
import { getCharactersBySeriesId, getCharacterSeriesByName } from '@/lib/data-service';
import { CharacterListPageClient } from './client-page';

export const dynamic = 'force-dynamic';

export default async function AdoptionCharacterListPage({ params }: { params: { name: string }}) {
  const seriesName = decodeURIComponent(params.name as string);
  
  if (!seriesName) {
    notFound();
  }

  const seriesData = await getCharacterSeriesByName(seriesName);
  if (!seriesData) {
    notFound();
  }
  
  const charactersData = await getCharactersBySeriesId(seriesData.id);

  return (
    <div className="container mx-auto">
        <CharacterListPageClient series={seriesData} characters={charactersData} />
    </div>
  );
}
