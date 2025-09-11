
import { getSiteContent } from '@/lib/data-service';
import { HomeClient } from '@/components/home-client';
import type { SiteContent } from '@/types';

export default async function HomePage() {
  const content = await getSiteContent();

  return (
    <HomeClient content={content} />
  );
}
