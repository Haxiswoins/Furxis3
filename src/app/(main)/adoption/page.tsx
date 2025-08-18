import { getCharacterSeries, getSiteContent } from '@/lib/data-service';
import { AdoptionSeriesClientPage } from './client-page';
import type { CharacterSeries, SiteContent } from '@/types';

// This is now a Server Component for better performance.
// The page will be statically generated at build time.
export default async function AdoptionSeriesPage() {
  const [seriesData, content] = await Promise.all([
    getCharacterSeries(),
    getSiteContent(),
  ]);

  return (
    <AdoptionSeriesClientPage seriesData={seriesData} content={content} />
  );
}
