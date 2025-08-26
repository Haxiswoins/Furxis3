
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FluidBackground } from '@/components/fluid-background';
import { LandingPageClient } from '@/components/landing-client';
import { HomeClient } from '@/components/home-client';
import { getSiteContent } from '@/lib/data-service';
import type { SiteContent } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';

function WelcomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showHome, setShowHome] = useState(false);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for a URL param to directly show home content
    if (searchParams.get('view') === 'home') {
      setShowHome(true);
    }
    
    // Prefetch home page assets
    router.prefetch('/home');

    // Fetch site content for the home page cards
    getSiteContent().then(data => {
      setContent(data);
      setIsLoading(false);
    });
  }, [searchParams, router]);

  const handleStateChange = (newstate: 'home' | 'landing') => {
      const url = newstate === 'home' ? '/?view=home' : '/';
      // Use replaceState to change URL without a full reload
      window.history.replaceState({ ...window.history.state, as: url, url: url }, '', url);
      setShowHome(newstate === 'home');
  };


  return (
    <div className="relative w-full h-screen">
      <FluidBackground />
      
      <AnimatePresence mode="wait">
        {!showHome ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            <LandingPageClient onNavigate={() => handleStateChange('home')} />
          </motion.div>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 overflow-y-auto"
          >
           {isLoading ? (
             <div></div> // You can put a loader here if you want
           ) : (
             <HomeClient content={content} onNavigate={() => handleStateChange('landing')} />
           )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}


export default function WelcomePage() {
    return (
        // Suspense is required for pages that use useSearchParams
        <Suspense fallback={<div>Loading...</div>}>
            <WelcomePageContent />
        </Suspense>
    )
}
