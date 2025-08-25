'use client';

import { getSiteContent } from '@/lib/data-service';
import { HomeClient } from '@/components/home-client';
import type { SiteContent } from '@/types';
import { useEffect, useState } from 'react';

// This is now a Server Component
export default function Home() {
  const [content, setContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    getSiteContent().then(setContent);
  }, []);


  return (
    <div className="container mx-auto">
        <HomeClient content={content} />
    </div>
  );
}
