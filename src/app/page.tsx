
'use client';

import { Suspense } from 'react';
import { LandingPageClient } from '@/components/landing-client';
import { FluidBackground } from '@/components/fluid-background';

export default function WelcomePage() {
  return (
    <>
      <FluidBackground />
      <Suspense fallback={<div className="bg-black w-screen h-screen"></div>}>
        <LandingPageClient />
      </Suspense>
    </>
  );
}
