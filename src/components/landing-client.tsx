
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function LandingPageClient() {
  const router = useRouter();
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  
  useEffect(() => {
    // Prefetch the home page as soon as the landing page is interactive
    router.prefetch('/home');

    const contentTimer = setTimeout(() => {
      setIsContentVisible(true);
    }, 500);

    return () => clearTimeout(contentTimer);
  }, [router]);


  const handleNavigate = () => {
    setIsWarping(true);
    // The AnimatePresence component will handle the exit animation
    // We just need to trigger the navigation after a delay for the animation to play
    setTimeout(() => {
        router.push('/home');
    }, 800); 
  };
  
  return (
    <AnimatePresence>
      {!isWarping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="relative h-screen w-full overflow-hidden bg-background"
        >
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isContentVisible ? 1 : 0, y: isContentVisible ? 0 : 20 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="text-center"
            >
                <h1 className="text-6xl md:text-8xl font-headline text-foreground whitespace-nowrap">前行无界</h1>
                <h2 className="text-2xl md:text-4xl font-extralight tracking-[0.2em] mt-2 mb-8 text-muted-foreground">FORWARD INFINITY</h2>
            </motion.div>

            <motion.div 
              className="absolute bottom-[20%]"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: isContentVisible ? 1 : 0, scale: isContentVisible ? 1 : 0.5 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
            >
              <button
                onClick={handleNavigate}
                aria-label="进入网站"
                className="group relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/50 bg-card/80 text-white transition-all duration-300 ease-in-out hover:scale-110 hover:border-primary hover:shadow-[0_0_35px_rgba(var(--primary-hsl),0.5)] active:scale-100 backdrop-blur-sm"
              >
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 scale-125 group-hover:scale-150 group-hover:opacity-0 transition-all duration-500 animate-pulse"></div>
                <Rocket 
                    className="h-10 w-10 text-primary/80 transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1 group-hover:scale-110"
                    style={{ transform: 'rotate(-45deg)' }}
                />
              </button>
            </motion.div>
          </div>

          <motion.div 
            className="absolute bottom-8 w-full text-center text-xs text-muted-foreground/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: isContentVisible ? 1 : 0 }}
            transition={{ duration: 1.0, ease: 'easeOut', delay: 0.5 }}
          >
             <p>Developed by Haxis and Mark</p>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
