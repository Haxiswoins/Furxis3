import { getWorks } from '@/lib/data-service';
import type { Work } from '@/types';
import { WorksPageClient } from './client-page';

export default async function WorksPage() {
  const worksData = await getWorks();
  
  const groupedWorks = worksData.reduce((acc, work) => {
    const year = new Date(work.completionDate).getFullYear().toString();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(work);
    return acc;
  }, {} as Record<string, Work[]>);
  
  const sortedYears = Object.keys(groupedWorks).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <WorksPageClient worksByYear={groupedWorks} sortedYears={sortedYears} />
  );
}
