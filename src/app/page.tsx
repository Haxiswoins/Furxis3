
'use client';

import { Suspense } from 'react';
import { LandingPageClient } from '@/landing-client';

export default function WelcomePage() {
  return (
    <div className="bg-transparent">
        <Suspense fallback={<div className="bg-black w-screen h-screen"></div>}>
          <LandingPageClient />
        </Suspense>
    </div>
  );
}
