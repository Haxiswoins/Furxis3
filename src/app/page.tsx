
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FluidBackground } from '@/components/fluid-background';
import { HomeClient } from '@/components/home-client';
import { getSiteContent } from '@/lib/data-service';
import type { SiteContent } from '@/types';
import Header from '@/components/header';

const welcomeContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
      duration: 1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.5,
      when: "afterChildren",
      staggerChildren: 0.1,
      staggerDirection: -1
    }
  }
};

const welcomeItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { y: -20, opacity: 0, transition: { duration: 0.3, ease: 'easeIn' }}
};


export default function UnifiedWelcomeAndHomePage() {
  const [view, setView] = useState<'welcome' | 'home'>('welcome');
  const [content, setContent] = useState<SiteContent | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    getSiteContent().then(data => {
      setContent(data);
    });
  }, []);

  const navigateToHome = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    // Framer Motion's exit animation handles the fade-out.
    // The `onExitComplete` of AnimatePresence will switch the view.
  };

  const navigateToWelcome = () => {
    if (isAnimating) return;
    setView('welcome');
  };

  const onAnimationComplete = () => {
      if (view === 'welcome') {
          setView('home');
      }
      setIsAnimating(false);
  }

  return (
    <div className="relative min-h-screen w-full bg-background">
      <FluidBackground />
      <Header />
      
      <AnimatePresence onExitComplete={onAnimationComplete}>
        {view === 'welcome' && (
           <div 
            key="welcome-wrapper"
            className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center"
            onClick={navigateToHome}
           >
            <motion.div
              key="welcome"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={welcomeContainerVariants}
            >
              <div className="text-center text-white">
                <motion.div variants={welcomeItemVariants}>
                    <h1 className="text-5xl md:text-7xl font-headline" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
                      欢迎来到
                    </h1>
                </motion.div>
                <motion.div variants={welcomeItemVariants}>
                    <div className="relative inline-block group mt-4">
                        <h1 className="text-4xl sm:text-5xl font-headline transition-colors duration-300 relative z-10" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
                        前行无界
                        </h1>
                        <div
                        className="absolute inset-0 flex items-center justify-center text-primary opacity-80"
                        style={{ zIndex: 5 }}
                        >
                        <span className="font-body text-2xl sm:text-4xl font-extralight tracking-[0.3em] whitespace-nowrap px-4 mt-10 sm:mt-12">
                            FORWARD INFINITY
                        </span>
                        </div>
                    </div>
                </motion.div>
              </div>
            </motion.div>
           </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {view === 'home' && (
          <motion.div
            key="home"
            className="relative z-10"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1, transition: { delay: 0.2, duration: 0.8 } }}
             exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            <HomeClient content={content} onNavigate={navigateToWelcome} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

