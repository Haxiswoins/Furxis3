
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This component now only serves to redirect any direct access attempts to the root page.
export default function HomePageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  // Render nothing, or a loading spinner, while redirecting.
  return null;
}
