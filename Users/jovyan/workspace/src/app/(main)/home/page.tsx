
import { getSiteContent } from '@/lib/data-service';
import { HomeClient } from '@/components/home-client';
import type { SiteContent } from '@/types';

export default async function HomePage() {
  const content = await getSiteContent();

  return (
    <div className="text-foreground">
        {/* Background elements are now part of the page layout to avoid stacking context issues */}
        <div 
          id="home-background" 
          className="fixed inset-0 z-[-1] opacity-50 blur-sm"
        ></div>
       <div className="fixed inset-0 z-[-1] bg-gradient-cover-top"></div>

       <HomeClient content={content} />
    </div>
  );
}
