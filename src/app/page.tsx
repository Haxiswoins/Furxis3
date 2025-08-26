
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FluidBackground } from '@/components/fluid-background';
import { HomeClient } from '@/components/home-client';
import { getSiteContent } from '@/lib/data-service';
import type { SiteContent } from '@/types';
import Header from '@/components/header';
import { LandingPageClient } from '@/components/landing-client';
import { useRouter } from 'next/navigation';

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

export default function WelcomePage() {
    const router = useRouter();

    const handleNavigate = () => {
        // Simple navigation to the home page
        router.push('/home');
    };

    return (
        <div className="relative min-h-screen w-full bg-background">
            <FluidBackground />
            <Header />
            <div className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center">
                <motion.div
                    key="welcome"
                    initial="hidden"
                    animate="visible"
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
                                <div className="absolute inset-0 flex items-center justify-center text-primary opacity-80" style={{ zIndex: 5 }}>
                                    <span className="font-body text-2xl sm:text-4xl font-extralight tracking-[0.3em] whitespace-nowrap px-4 mt-10 sm:mt-12">
                                        FORWARD INFINITY
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
            {/* The LandingPageClient is now just for the rocket button */}
            <LandingPageClient onNavigate={handleNavigate} />
        </div>
    );
}
