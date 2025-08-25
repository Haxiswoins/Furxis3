
import { getSiteContent } from '@/lib/data-service';
import { HomeClient } from '@/components/home-client';
import type { SiteContent } from '@/types';

// This is now a Server Component
export default async function HomePage() {
  const content: SiteContent | null = await getSiteContent();

  return (
    <div className="container mx-auto">
        <HomeClient content={content} />
    </div>
  );
}
