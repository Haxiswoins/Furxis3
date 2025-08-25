
import { getCommissionOptions, getSiteContent } from '@/lib/data-service';
import { CommissionPageClient } from './page-client';
import type { CommissionOption } from '@/types';

export const dynamic = 'force-dynamic';

// This is now a Server Component for better performance.
// The page will be statically generated at build time.
export default async function CommissionPage() {
  const [options, content] = await Promise.all([
    getCommissionOptions(),
    getSiteContent(),
  ]);

  const commissionOptionsByYear = options.reduce((acc, option) => {
    const yearMatch = option.name.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : '未知年份';
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(option);
    return acc;
  }, {} as Record<string, CommissionOption[]>);

  const sortedYears = Object.keys(commissionOptionsByYear).sort((a, b) => {
     if (a === '未知年份') return 1;
     if (b === '未知年份') return -1;
     return parseInt(b) - parseInt(a);
  });

  return (
    <CommissionPageClient
      commissionOptionsByYear={commissionOptionsByYear}
      sortedYears={sortedYears}
      content={content}
    />
  );
}
