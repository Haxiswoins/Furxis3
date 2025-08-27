
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

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
  const { theme } = useTheme();
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const animationInstance = useRef<any>(null);
  
  const initializeBackground = () => {
      // Prevent re-initialization
      if (animationInstance.current || !theme) return;
      
      if (window.Color4Bg && typeof window.Color4Bg.CurveGradientBg === 'function') {
          try {
              if (document.getElementById('box')) {
                const lightThemeColors = ["#ff7300","#24428a","#8EDBFD","#ffffff","#E7F9FE","#ff5d05"];
                const darkThemeColors = ["#9FE3EE","#1E5880","#103E62","#002848","#051124","#1a1b29"];

                const instance = new window.Color4Bg.CurveGradientBg({
                    dom: "box",
                    colors: theme === 'light' ? lightThemeColors : darkThemeColors,
                    loop: true
                });
                
                instance.update('scale', 0.2);
                instance.update('noise', 0.05);
                
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
    // Crucial fix: Do not proceed until the theme is definitively set to 'light' or 'dark'.
    // This prevents initialization with a default/null theme, avoiding the flash of incorrect colors.
    if (!theme) return;
      
    // Prefetch the home page as soon as the landing page is interactive
    router.prefetch('/home');

    // Load the script and initialize background when the theme is ready
    const script = document.createElement('script');
    script.src = "/CurveGradientBg.min.js";
    script.async = true;
    script.onload = () => {
        initializeBackground();
    };
     script.onerror = (e) => {
        console.error('Failed to load CurveGradientBg.min.js script:', e);
    };

    document.body.appendChild(script);

    const contentTimer = setTimeout(() => {
      setIsContentVisible(true);
    }, 500);

    return () => {
      clearTimeout(contentTimer);
      // Clean up script tag
      document.body.removeChild(script);
      // Ensure we clear the animation instance reference on cleanup
      animationInstance.current = null;
    };
    // The dependency on `theme` ensures this effect re-runs if the theme changes,
    // and the guard clause `if (!theme) return;` ensures it only runs with a valid theme.
  }, [router, theme]);

  const handleNavigate = () => {
    setIsWarping(true);
    setTimeout(() => {
        router.push('/home');
    }, 800); 
  };
  
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black cursor-pointer" onClick={handleNavigate}>
      <div id="box" className="absolute inset-0 z-0"></div>
      
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
          <p className="text-white/80 font-light text-base animate-pulse">
            任意点击进入首页
          </p>
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
