
import * as React from 'react';
import { getAggregatedUsers, getBadges } from '@/lib/data-service';
import { UserManagementPageClient } from './client-page';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

function LoadingSkeleton() {
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <Skeleton className="h-9 w-32" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
            <div className="border rounded-lg p-4">
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            </div>
        </div>
    )
}

export default async function UserManagementPage() {
    // Fetch data on the server
    const [users, badges] = await Promise.all([getAggregatedUsers(), getBadges()]);

    return (
        <React.Suspense fallback={<LoadingSkeleton />}>
            <UserManagementPageClient initialUsers={users} initialBadges={badges} />
        </React.Suspense>
    );
}
