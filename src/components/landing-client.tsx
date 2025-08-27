
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

// Define the custom type on the Window interface for the background script
declare global {
    interface Window {
        Color4Bg?: {
            AmbientLightBg: new (options: {
                dom: string,
                colors: string[],
                loop: boolean
            }) => any;
        }
    }
}


export function LandingPageClient() {
  const router = useRouter();
  const [isWarping, setIsWarping] = useState(false);
  
  useEffect(() => {
    // Prefetch the home page as soon as the landing page is interactive
    router.prefetch('/home');

    // Safely initialize the background effect after the component has mounted
    // and the script from the layout has loaded.
    try {
      if (window.Color4Bg && window.Color4Bg.AmbientLightBg) {
        new window.Color4Bg.AmbientLightBg({
          dom: "box",
          colors: ["#007FFE", "#3099FE", "#60B2FE", "#90CCFE", "#C0E5FE", "#F0FFFE"],
          loop: true
        });
      } else {
        console.warn('AmbientLightBg script not yet available.');
      }
    } catch (error) {
      console.error('Failed to initialize AmbientLightBg:', error);
    }

  }, []);

  const handleNavigate = () => {
    setIsWarping(true);
    // Wait for the fade-out animation to be noticeable before navigating
    setTimeout(() => {
        router.push('/home');
    }, 800); 
  };
  
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* The container for the background effect */}
      <div id="box" className="absolute inset-0 z-0" />
      
      <motion.div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: isWarping ? 0 : 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute bottom-[20%]">
          <button
            onClick={handleNavigate}
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
        animate={{ opacity: isWarping ? 0 : 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
         <p>Developed by Haxis and Mark</p>
      </motion.div>

    </div>
  );
}
