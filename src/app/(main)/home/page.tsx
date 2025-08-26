
'use client';

import { useState, useEffect } from 'react';
import { useRouter }from 'next/navigation';
import { HomeClient } from '@/components/home-client';
import { getSiteContent } from '@/lib/data-service';
import type { SiteContent } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';


function HomeLoadingSkeleton() {
    return (
        <div className="container mx-auto">
            <div className="py-8 md:py-12">
                <div className="text-center mb-10 md:mb-16">
                     <Skeleton className="h-12 w-48 mx-auto" />
                     <Skeleton className="h-8 w-64 mx-auto mt-4" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-7xl mx-auto">
                    <Skeleton className="aspect-[4/5] rounded-2xl" />
                    <Skeleton className="aspect-[4/5] rounded-2xl" />
                    <Skeleton className="aspect-[4/5] rounded-2xl" />
                </div>
                 <div className="w-full py-8 text-center mt-auto">
                    <Skeleton className="h-10 w-32 mx-auto" />
                </div>
            </div>
        </div>
    )
}


// The /home page is now its own route again.
export default function HomePage() {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
    getSiteContent().then(data => {
      setContent(data);
      setIsLoading(false);
    });
  }, []);

  // The onNavigate function will now navigate back to the root page.
  const handleNavigateToRoot = () => {
      router.push('/');
  }

  if (isLoading) {
      return <HomeLoadingSkeleton />;
  }

  return (
    <HomeClient content={content} onNavigate={handleNavigateToRoot} />
  );
}
