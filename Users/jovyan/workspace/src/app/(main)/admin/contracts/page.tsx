
import { getSiteContent } from '@/lib/data-service';
import { ContractsClientPage } from './client-page';

export default async function ContractsPage() {
  const content = await getSiteContent();
  return <ContractsClientPage initialContent={content} />;
}
