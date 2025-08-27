
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';
import Script from 'next/script';
import { motion } from 'framer-motion';

// Define the custom type on the Window interface
declare global {
    interface Window {
        Color4Bg?: {
            CurveGradientBg: new (options: {
                dom: string,
                colors: string[],
                loop: boolean
            }) => any;
        }
    }
}

export function LandingPageClient() {
  const router = useRouter();
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const animationInstance = useRef<any>(null);

  const initializeBackground = () => {
      // Ensure the script has loaded and the object is available on window
      if (window.Color4Bg && typeof window.Color4Bg.CurveGradientBg === 'function') {
          try {
              // Ensure the target DOM element exists before initializing
              if (document.getElementById('box')) {
                animationInstance.current = new window.Color4Bg.CurveGradientBg({
                    dom: "box",
                    colors: ["#ff7300","#24428a","#8EDBFD","#ffffff","#E7F9FE","#ff5d05"],
                    loop: true
                });
              }
          } catch (error) {
              console.error('Failed to initialize CurveGradientBg:', error);
          }
      } else {
        console.error('CurveGradientBg script loaded, but Color4Bg object not found or not a constructor.');
      }
  };

  useEffect(() => {
    // Prefetch the home page as soon as the landing page is interactive
    router.prefetch('/home');

    const contentTimer = setTimeout(() => {
      setIsContentVisible(true);
    }, 500);

    // The cleanup function will be called when the component unmounts
    return () => {
      clearTimeout(contentTimer);
      // Even if we can't call a specific destroy method, clearing the reference
      // helps with garbage collection and prevents memory leaks.
      animationInstance.current = null;
    };
  }, [router]);

  const handleNavigate = () => {
    setIsWarping(true);
    // Use motion's onAnimationComplete or a timeout to navigate
    setTimeout(() => {
        router.push('/home');
    }, 800); 
  };
  
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <div id="box" className="absolute inset-0 z-0"></div>
      <Script
        src="/CurveGradientBg.min.js"
        strategy="lazyOnload"
        onLoad={initializeBackground}
        onError={(e) => {
            console.error('Failed to load CurveGradientBg.min.js script:', e);
        }}
      />
      
      <motion.div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: isContentVisible ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div
            className="absolute bottom-[20%]"
            animate={{ opacity: isWarping ? 0 : 1 }}
            transition={{ duration: 0.3 }}
        >
          <button
            onClick={handleNavigate}
            aria-label="进入网站"
            className="group relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/50 bg-black/30 text-white transition-all duration-300 ease-in-out hover:scale-110 hover:border-primary hover:shadow-[0_0_35px_rgba(255,115,0,0.7)] active:scale-100 backdrop-blur-sm"
          >
            <div className="absolute inset-0 rounded-full border-2 border-white/20 scale-125 group-hover:scale-150 group-hover:opacity-0 transition-all duration-500 animate-pulse"></div>
            <Rocket 
                className="h-10 w-10 text-primary/80 transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1 group-hover:scale-110"
                style={{ transform: 'rotate(-45deg)' }}
            />
          </button>
        </motion.div>
      </motion.div>

       <motion.div
            className="absolute bottom-8 w-full text-center text-xs text-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: isContentVisible && !isWarping ? 1 : 0 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
       >
         <p>Developed by Haxis and Mark</p>
      </motion.div>

    </div>
  );
}
