import { getAggregatedUsers, getBadges } from '@/lib/data-service';
import { UserManagementPageClient } from './client-page';

export const dynamic = 'force-dynamic';

export default async function UserManagementPage() {
  // This is a server component, responsible for fetching initial data.
  const [users, badges] = await Promise.all([
    getAggregatedUsers(),
    getBadges(),
  ]);

  // The client component receives the data as props to handle interactivity.
  return <UserManagementPageClient initialUsers={users} initialBadges={badges} />;
}
