import { getCommissionOptions, getSiteContent } from '@/lib/data-service';
import { CommissionClientPage } from './client-page';
import { CommissionPageClient } from './page-client';

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
    <CommissionPageClient options={sortedOptions} content={content} />
  );
}
