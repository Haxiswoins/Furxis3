
import { getCharacterSeries, getSiteContent } from '@/lib/data-service';
import { AdoptionSeriesClientPage } from './client-page';
import type { CharacterSeries, SiteContent } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdoptionSeriesPage() {
  const [seriesData, content] = await Promise.all([
    getCharacterSeries(),
    getSiteContent(),
  ]);

  return (
    <div className="container mx-auto">
        <AdoptionSeriesClientPage seriesData={seriesData} content={content} />
    </div>
  );
}
