
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import Script from 'next/script';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';

// Define the custom type on the Window interface
declare global {
    interface Window {
        Color4Bg?: {
            CurveGradientBg: new (options: {
                dom: string,
                colors: [string, string, string, string],
                duration: number,
                angle: number,
            }) => any;
        }
    }
}

export function LandingPageClient() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  
  // This effect runs once when the component mounts and the theme is determined.
  useEffect(() => {
    // Do not proceed until theme is determined and the script is loaded
    if (!theme || !isScriptLoaded || !boxRef.current) return;

    let gradient: any;

    try {
        if (window.Color4Bg && window.Color4Bg.CurveGradientBg) {
             gradient = new window.Color4Bg.CurveGradientBg({
                dom: "box",
                colors: theme === 'dark' 
                    ? ["#121826", "#121826", "#121826", "#121826"]
                    : ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
                duration: 10000,
                angle: 60,
             });
        }
    } catch (e) {
        console.error("Failed to initialize CurveGradientBg:", e);
    }
    
    // Cleanup function to destroy the gradient instance when the component unmounts
    return () => {
        if (gradient && typeof gradient.destroy === 'function') {
            gradient.destroy();
        }
    };
  }, [theme, isScriptLoaded]); // Rerun when theme or script load state changes

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
    setTimeout(() => {
        router.push('/home');
    }, 600); 
  };
  
  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <Script
          src="/CurveGradientBg.min.js"
          strategy="lazyOnload"
          onLoad={() => setIsScriptLoaded(true)}
          onError={(e) => {
              console.error('Failed to load CurveGradientBg script:', e);
          }}
      />
      
      <div 
        id="box" 
        ref={boxRef} 
        className={cn(
            "absolute inset-0 z-0 transition-opacity duration-500",
            isWarping ? "opacity-0" : "opacity-100"
        )}
      ></div>

      <div className={cn(
        "absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-500",
        isContentVisible ? 'opacity-100' : 'opacity-0',
        isWarping ? 'opacity-0' : 'opacity-100'
      )}>
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
      </div>
      
       {/* Transition Mask */}
       <motion.div 
        className="fixed inset-0 z-[100] bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: isWarping ? 1 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut'}}
        style={{ pointerEvents: 'none' }}
       >
       </motion.div>

      <div className={cn(
        "absolute bottom-8 w-full text-center text-xs text-white/40 transition-opacity duration-1000 ease-in-out",
        isContentVisible ? "opacity-100" : "opacity-0",
        isWarping ? 'opacity-0' : 'opacity-100'
      )}>
         <p>Developed by Haxis and Mark</p>
      </div>
    </div>
  );
}
