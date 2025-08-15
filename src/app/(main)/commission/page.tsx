import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getCommissionOptions, getSiteContent } from '@/lib/data-service';
import { CommissionClientPage } from './client-page';

function CommissionCardSkeleton() {
  return (
    <div className="overflow-hidden shadow-lg flex flex-col">
      <div className="relative aspect-[3/4] bg-muted">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}

export default async function CommissionPage() {
  const [options, content] = await Promise.all([
    getCommissionOptions(),
    getSiteContent(),
  ]);

  const sortedOptions = options.sort((a, b) => {
    const timeA = parseInt(a.id.split('_')[1] || '0');
    const timeB = parseInt(b.id.split('_')[1] || '0');
    return timeB - timeA;
  });

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline">委托申请</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {content?.commissionPageDescription || '选择一个基础套餐开始您的定制兽装之旅。'}
        </p>
      </div>
       <CommissionClientPage commissionOptions={sortedOptions} />
    </div>
  );
}
