

import { getCharacterSeries } from '@/lib/data-service';
import { AdminCharacterSeriesClient } from './client-page';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

function AdminCharacterSeriesPageSkeleton() {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-9 w-48" />
            </div>
            <div className="border rounded-lg">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]"><Skeleton className="h-5 w-full" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-full" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-full" /></TableHead>
                            <TableHead className="text-right w-[120px]"><Skeleton className="h-5 w-full" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(3)].map((_, i) => (
                             <TableRow key={i}>
                                <TableCell><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Skeleton className="h-8 w-8" />
                                        <Skeleton className="h-8 w-8" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </div>
        </div>
    )
}

export default async function AdminCharacterSeriesPage() {
    // Data fetching is now done on the server to pass to the client component
    // This allows for initial static generation or fast server-side rendering.
    try {
        const seriesData = await getCharacterSeries();
        return <AdminCharacterSeriesClient series={seriesData} />;
    } catch (error) {
        console.error("Failed to fetch character series:", error);
        // You can return an error component here
        return <div>无法加载数据，请稍后重试。</div>
    }
}
