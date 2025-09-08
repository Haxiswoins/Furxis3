
import { getCharacterSeries } from '@/lib/data-service';
import { AdoptionSeriesClientPage } from './client-page';

// This is now a Server Component for better performance.
// The page will be statically generated at build time.
export default async function AdoptionSeriesPage() {
  const seriesData = await getCharacterSeries();

  return (
    <div className="container mx-auto">
        <AdoptionSeriesClientPage seriesData={seriesData} />
    </div>
  );
}

