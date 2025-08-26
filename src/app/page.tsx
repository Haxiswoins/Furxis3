
'use client';

import { LandingPageClient } from '@/components/landing-client';
import { FluidBackground } from '@/components/fluid-background';
import { FluidBackgroundInitializer } from '@/components/fluid-background-initializer';

export default function WelcomePage() {
  
  return (
      <>
        <FluidBackground />
        <LandingPageClient />
        <FluidBackgroundInitializer />
      </>
  );
}
