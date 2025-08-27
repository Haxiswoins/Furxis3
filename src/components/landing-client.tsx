
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
  const scriptElement = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Prefetch the home page
    router.prefetch('/home');

    // Define color schemes
    const lightThemeColors = ["#ff7300","#24428a","#8EDBFD","#ffffff","#E7F9FE","#ff5d05"];
    const darkThemeColors = ["#9FE3EE","#1E5880","#103E62","#002848","#051124","#1a1b29"];

    const initializeBackground = () => {
      // Prevent re-initialization
      if (animationInstance.current) return;
      
      if (window.Color4Bg && typeof window.Color4Bg.CurveGradientBg === 'function') {
          try {
              if (document.getElementById('box')) {
                // Always initialize with the light theme colors by default
                const instance = new window.Color4Bg.CurveGradientBg({
                    dom: "box",
                    colors: lightThemeColors,
                    loop: true
                });
                
                // Use the update method which is the correct API
                instance.update('scale', 0.2);
                instance.update('noise', 0.05);
                
                animationInstance.current = instance;

                // After initializing, check if the current theme is dark and update if necessary
                if (theme === 'dark') {
                  instance.colors(darkThemeColors);
                }
              }
          } catch (error) {
              console.error('Failed to initialize CurveGradientBg:', error);
          }
      }
    };

    // Load the script
    const script = document.createElement('script');
    script.src = "/CurveGradientBg.min.js";
    script.async = true;
    script.onload = initializeBackground;
    script.onerror = (e) => {
        console.error('Failed to load CurveGradientBg.min.js script:', e);
    };

    document.body.appendChild(script);
    scriptElement.current = script;

    const contentTimer = setTimeout(() => {
      setIsContentVisible(true);
    }, 500);

    return () => {
      clearTimeout(contentTimer);
      if (scriptElement.current && scriptElement.current.parentNode) {
          scriptElement.current.parentNode.removeChild(scriptElement.current);
      }
      animationInstance.current = null;
    };
  }, [router]); // Run only once on mount

  // This separate effect handles theme changes AFTER the initial load
  useEffect(() => {
    if (animationInstance.current && theme) {
      const lightThemeColors = ["#ff7300","#24428a","#8EDBFD","#ffffff","#E7F9FE","#ff5d05"];
      const darkThemeColors = ["#9FE3EE","#1E5880","#103E62","#002848","#051124","#1a1b29"];
      
      // Update colors based on the current theme
      if (theme === 'dark') {
        animationInstance.current.colors(darkThemeColors);
      } else {
        animationInstance.current.colors(lightThemeColors);
      }
    }
  }, [theme]);


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
