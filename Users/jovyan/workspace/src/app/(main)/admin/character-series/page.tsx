

import { getCharacterSeries } from '@/lib/data-service';
import { AdminCharacterSeriesClient } from '@/app/(main)/admin/character-series/client-page';

export const dynamic = 'force-dynamic';

export default async function AdminCharacterSeriesPage() {
  const seriesData = await getCharacterSeries();
  return <AdminCharacterSeriesClient series={seriesData} />;
}
