import { getCharacterSeries, getSiteContent } from '@/lib/data-service';
import { AdoptionSeriesClientPage } from './client-page';

export default async function AdoptionSeriesPage() {
  const [seriesData, content] = await Promise.all([
    getCharacterSeries(),
    getSiteContent(),
  ]);

  return (
    <AdoptionSeriesClientPage seriesData={seriesData} content={content} />
  );
}
