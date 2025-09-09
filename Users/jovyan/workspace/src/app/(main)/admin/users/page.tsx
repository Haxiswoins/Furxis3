
import { getAggregatedUsers, getBadges } from '@/lib/data-service';
import { UserManagementPageClient } from './client-page';

export const dynamic = 'force-dynamic';

export default async function UserManagementPage() {
  const [userData, badgeData] = await Promise.all([
    getAggregatedUsers(),
    getBadges(),
  ]);

  return <UserManagementPageClient users={userData} badges={badgeData} />;
}
