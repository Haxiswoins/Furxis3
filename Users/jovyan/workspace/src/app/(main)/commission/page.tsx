

import { getCommissionOptions, getSiteContent } from '@/lib/data-service';
import { CommissionPageClient } from './client-page';
import type { CommissionOption } from '@/types';

export default async function CommissionPage() {
  const [options, content] = await Promise.all([
    getCommissionOptions(),
    getSiteContent(),
  ]);

  const commissionOptionsByYear = options.reduce((acc, option) => {
    const year = option.commissionDate ? new Date(option.commissionDate).getFullYear().toString() : '未知年份';
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(option);
    return acc;
  }, {} as Record<string, CommissionOption[]>);

  // Sort commissions within each year by month, descending
  for (const year in commissionOptionsByYear) {
    commissionOptionsByYear[year].sort((a, b) => {
      const dateA = new Date(a.commissionDate || 0).getTime();
      const dateB = new Date(b.commissionDate || 0).getTime();
      return dateB - dateA;
    });
  }

  const sortedYears = Object.keys(commissionOptionsByYear).sort((a, b) => {
     if (a === '未知年份') return 1;
     if (b === '未知年份') return -1;
     return parseInt(b) - parseInt(a);
  });

  return (
    <div className="container mx-auto">
        <CommissionPageClient
            commissionOptionsByYear={commissionOptionsByYear}
            sortedYears={sortedYears}
            content={content}
        />
    </div>
  );
}

    

    