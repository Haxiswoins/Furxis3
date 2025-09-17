import { getSiteContent } from '@/lib/data-service';
import { ContractsClientPage } from './client-page';

export const dynamic = 'force-dynamic';

export default async function ContractsPage() {
  const content = await getSiteContent();
  return <ContractsClientPage initialContent={content} />;
}
