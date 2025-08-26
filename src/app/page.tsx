
'use client';

import { Suspense } from 'react';
import { LandingPageClient } from '@/components/landing-client';
import { AestheticFluidBackground } from '@/components/aesthetic-fluid-background';

export default function WelcomePage() {
  return (
    <>
      <AestheticFluidBackground />
      <Suspense fallback={<div className="bg-black w-screen h-screen"></div>}>
        <LandingPageClient />
      </Suspense>
    </>
  );
}
