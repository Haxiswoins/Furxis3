
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
  const [showBox, setShowBox] = useState(false);
  const animationInstance = useRef<any>(null);
  const scriptElement = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Prefetch the home page
    router.prefetch('/home');
  }, [router]);

  useEffect(() => {
    if (!theme) return;

    setShowBox(true);

    const initializeBackground = () => {
      if (animationInstance.current || !document.getElementById('box')) return;
      
      if (window.Color4Bg && typeof window.Color4Bg.CurveGradientBg === 'function') {
          try {
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

          } catch (error) {
              console.error('Failed to initialize CurveGradientBg:', error);
          }
      }
    };

    const script = document.createElement('script');
    script.src = "/CurveGradientBg.min.js";
    script.async = true;
    script.onload = initializeBackground;
    script.onerror = (e) => console.error('Failed to load CurveGradientBg.min.js script:', e);

    document.body.appendChild(script);
    scriptElement.current = script;

    const contentTimer = setTimeout(() => setIsContentVisible(true), 500);

    return () => {
      clearTimeout(contentTimer);
      if (scriptElement.current && scriptElement.current.parentNode) {
          scriptElement.current.parentNode.removeChild(scriptElement.current);
      }
      animationInstance.current = null;
    };
  }, [theme]);

  const handleNavigate = () => {
    setIsWarping(true);
    setTimeout(() => router.push('/home'), 800); 
  };
  
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black cursor-pointer" onClick={handleNavigate}>
      {showBox && <div id="box" className="absolute inset-0 z-0"></div>}
      
      <motion.div
        className="absolute inset-0 z-20 flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: isContentVisible ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div 
            className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: isWarping ? 0 : 1 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isContentVisible ? 1 : 0, y: isContentVisible ? 0 : 20 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            >
                <p className="text-xl font-semibold">欢迎来到</p>
                <p className="text-lg font-light mb-4">Welcome to</p>
                <h1 className="text-7xl md:text-8xl font-headline">前行无界</h1>
                <h2 className="text-4xl md:text-5xl font-extralight tracking-[0.2em] mt-2 mb-8">FORWARD INFINITY</h2>
                <p className="text-sm font-light max-w-md leading-relaxed">
                    前行无界工作室正式成立于2024年, <br/>
                    我们致力于打造富有创意与品质优良的兽装及相关设计作品, <br/>
                    欢迎您的到访。
                </p>
            </motion.div>
        </motion.div>
      </motion.div>

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
