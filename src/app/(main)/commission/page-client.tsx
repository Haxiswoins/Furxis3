
'use client';

import { CommissionClientPage } from './client-page';
import type { CommissionOption, SiteContent } from '@/types';

type CommissionPageClientProps = {
  commissionOptionsByYear: Record<string, CommissionOption[]>;
  sortedYears: string[];
  content: SiteContent | null;
}

export function CommissionPageClient({ commissionOptionsByYear, sortedYears, content }: CommissionPageClientProps) {
  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-headline">委托申请</h1>
        <p className="mt-2 text-base sm:text-lg text-muted-foreground">
          {content?.commissionPageDescription || '选择一个基础套餐开始您的定制兽装之旅。'}
        </p>
      </div>
      <div className="space-y-12">
        {sortedYears.map(year => (
          <div key={year}>
            <h2 className="text-3xl font-headline mb-6 pl-4 border-l-4 border-primary">{year}</h2>
            <CommissionClientPage commissionOptions={commissionOptionsByYear[year]} />
          </div>
        ))}
      </div>
    </div>
  );
}
