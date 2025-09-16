
import { getCharacterSeries } from '@/lib/data-service';
import { AdminCharacterSeriesClient } from './client-page';
import type { CharacterSeries } from '@/types';

export default async function AdminCharacterSeriesPage() {
  const seriesData: CharacterSeries[] = await getCharacterSeries();

  return <AdminCharacterSeriesClient series={seriesData} />;
}

    