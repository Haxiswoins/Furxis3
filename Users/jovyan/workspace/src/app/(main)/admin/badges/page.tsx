import { getBadges } from '@/lib/data-service';
import { BadgesClientPage } from './client-page';

export const dynamic = 'force-dynamic';

export default async function BadgesPage() {
  const badges = await getBadges();
  return <BadgesClientPage initialBadges={badges} />;
}
