

import { getCharacters, getCommissionOptions, getAllOrders, getWorks } from '@/lib/data-service';
import { AdminDashboardClient } from './client-page';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

function AdminDashboardPageSkeleton() {
    return (
        <div>
            <Skeleton className="h-9 w-32 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-12" />
                            <Skeleton className="h-4 w-32 mt-1" />
                        </CardContent>
                    </Card>
                ))}
            </div>
             <div className="mt-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-5 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default async function AdminDashboardPage() {
    try {
        const [charactersData, commissionOptionsData, ordersData, worksData] = await Promise.all([
            getCharacters(),
            getCommissionOptions(),
            getAllOrders(),
            getWorks()
        ]);
        return (
            <AdminDashboardClient 
                characters={charactersData}
                commissionOptions={commissionOptionsData}
                orders={ordersData}
                works={worksData}
            />
        );
    } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        return <div>无法加载仪表盘数据。</div>
    }
}

