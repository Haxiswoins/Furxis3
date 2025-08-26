
'use client';

import { Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type LandingPageClientProps = {
  onNavigate: () => void;
};

export function LandingPageClient({ onNavigate }: LandingPageClientProps) {
  const router = useRouter();

  useEffect(() => {
    // Prefetch the home page to make the transition faster
    router.prefetch('/home');
  }, [router]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-transparent">
      
      <motion.div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        <div className="absolute bottom-[20%]">
          <button
            onClick={onNavigate}
            aria-label="进入网站"
            className="group relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/50 bg-black/30 text-white transition-all duration-300 ease-in-out hover:scale-110 hover:border-primary hover:shadow-[0_0_35px_rgba(255,97,47,0.7)] active:scale-100 backdrop-blur-sm"
          >
            <div className="absolute inset-0 rounded-full border-2 border-white/20 scale-125 group-hover:scale-150 group-hover:opacity-0 transition-all duration-500 animate-pulse"></div>
            <Rocket 
                className="h-10 w-10 text-primary/80 transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1 group-hover:scale-110"
                style={{ transform: 'rotate(-45deg)' }}
            />
          </button>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 w-full text-center text-xs text-white/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
         <p>Developed by Haxis and Mark</p>
      </motion.div>

    </div>
  );
}
