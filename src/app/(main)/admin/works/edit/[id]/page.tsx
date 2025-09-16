
'use client';

import { AdminWorkForm } from '@/components/admin-work-form';
import { getWorkById } from '@/lib/data-service';
import type { Work } from '@/types';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditWorkPage() {
    const params = useParams();
    const id = params.id as string;
    const [work, setWork] = useState<Work | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(id) {
            getWorkById(id).then(item => {
                setWork(item);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) {
        return (
             <div>
                <Skeleton className="h-9 w-1/4 mb-6" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-1/6" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                    <Skeleton className="h-12 w-32" />
                </div>
            </div>
        )
    }

    if (!work) {
        return <div>未找到该作品。</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-headline mb-6">编辑作品：{work.workName}</h1>
            <AdminWorkForm work={work} />
        </div>
    );
}
