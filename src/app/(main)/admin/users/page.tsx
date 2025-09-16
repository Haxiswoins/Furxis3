
import { getAggregatedUsers, getBadges } from '@/lib/data-service';
import { UserManagementPageClient } from './client-page';

export const dynamic = 'force-dynamic';

export default async function UserManagementPage() {
  const [users, badges] = await Promise.all([
    getAggregatedUsers(),
    getBadges(),
  ]);

  return <UserManagementPageClient initialUsers={users} initialBadges={badges} />;
}
