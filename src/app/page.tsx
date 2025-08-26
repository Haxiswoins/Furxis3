
'use client';

import { useRouter } from 'next/navigation';
import { LandingPageClient } from '@/components/landing-client';

// This is now just the root entry page.
// The layout is handled by the parent layout.tsx and AppShell.
export default function WelcomePage() {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/home');
  };

  return (
      <LandingPageClient onNavigate={handleNavigate} />
  );
}
