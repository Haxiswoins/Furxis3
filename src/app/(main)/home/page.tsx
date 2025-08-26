
import { getSiteContent } from '@/lib/data-service';
import { HomeClient } from '@/components/home-client';
import type { SiteContent } from '@/types';
import { FluidBackground } from '@/components/fluid-background';

// This is now a Server Component
export default async function HomePage() {
  const content: SiteContent | null = await getSiteContent();

  return (
    <div className="relative w-full h-full">
      <FluidBackground />
      <HomeClient content={content} />
    </div>
  );
}
