
'use client';

import { Suspense } from 'react';
import { LandingPageClient } from '@/landing-client';

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="bg-black w-screen h-screen"></div>}>
      <div id="fluid-bg-container" className="absolute inset-0 z-0"></div>
      <LandingPageClient />
    </Suspense>
  );
}
