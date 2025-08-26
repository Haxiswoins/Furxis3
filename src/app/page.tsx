
'use client';

import { Suspense } from 'react';
import { LandingPageClient } from '@/components/landing-client';

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="bg-black w-screen h-screen"></div>}>
      <LandingPageClient />
    </Suspense>
  );
}
