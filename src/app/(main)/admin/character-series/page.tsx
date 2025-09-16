
import { getCharacterSeries } from '@/lib/data-service';
import { AdminCharacterSeriesClient } from './client-page';
import type { CharacterSeries } from '@/types';

// This is a Server Component that fetches data on the server
// and passes it down to a Client Component for interaction.
export const dynamic = 'force-dynamic';

export default async function AdminCharacterSeriesPage() {
  const seriesData: CharacterSeries[] = await getCharacterSeries();

  return <AdminCharacterSeriesClient series={seriesData} />;
}
