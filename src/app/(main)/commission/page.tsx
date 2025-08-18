import { getCommissionOptions, getSiteContent } from '@/lib/data-service';
import { CommissionPageClient } from './page-client';

// This is now a Server Component for better performance.
// The page will be statically generated at build time.
export default async function CommissionPage() {
  const [options, content] = await Promise.all([
    getCommissionOptions(),
    getSiteContent(),
  ]);

  return (
    <CommissionPageClient options={options} content={content} />
  );
}
