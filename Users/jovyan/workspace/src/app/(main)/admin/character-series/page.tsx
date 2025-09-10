

import { getCharacterSeries } from '@/lib/data-service';
import { AdminCharacterSeriesClient } from './client-page';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

export default async function AdminCharacterSeriesPage() {
    const seriesData = await getCharacterSeries();
    return <AdminCharacterSeriesClient series={seriesData} />;
}
