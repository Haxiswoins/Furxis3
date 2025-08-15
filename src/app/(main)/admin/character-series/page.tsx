import { getCharacterSeries } from '@/lib/data-service';
import { AdminCharacterSeriesClient } from './client-page';

export default async function AdminCharacterSeriesPage() {
  const series = await getCharacterSeries();
  
  return (
    <AdminCharacterSeriesClient series={series} />
  );
}
