
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
            }) => any; // Keep it 'any' as we don't know the exact class type
        }
    }
}

export function LandingPageClient() {
  const router = useRouter();
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const animationInstance = useRef<any>(null);
  
  const initializeBackground = () => {
      if (animationInstance.current) return;
      
      if (window.Color4Bg && typeof window.Color4Bg.CurveGradientBg === 'function') {
          try {
              if (document.getElementById('box')) {
                const instance = new window.Color4Bg.CurveGradientBg({
                    dom: "box",
                    colors: ["#ff7300","#24428a","#8EDBFD","#ffffff","#E7F9FE","#ff5d05"],
                    loop: true
                });
                // After analyzing the provided source code, the correct way to update the scale
                // is by calling the 'update' method with 'scale' as the key.
                instance.update('scale', 0.2);
                animationInstance.current = instance;
              }
          } catch (error) {
              console.error('Failed to initialize CurveGradientBg:', error);
          }
      } else {
        console.error('CurveGradientBg script loaded, but Color4Bg object not found or not a constructor.');
      }
  };

  useEffect(() => {
    router.prefetch('/home');

    const contentTimer = setTimeout(() => {
      setIsContentVisible(true);
    }, 500);

    return () => {
      clearTimeout(contentTimer);
      // Attempt to call a destroy method if it exists, and clear the ref
      if (animationInstance.current && typeof animationInstance.current.destroy === 'function') {
        animationInstance.current.destroy();
      }
      animationInstance.current = null;
    };
  }, [router]);

  const handleNavigate = () => {
    setIsWarping(true);
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
