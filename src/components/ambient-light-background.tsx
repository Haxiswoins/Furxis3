
'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

type AestheticFluidBackgroundProps = {
  onReady?: () => void;
};

const AestheticFluidBackground = ({ onReady }: AestheticFluidBackgroundProps) => {
  const { theme } = useTheme();
  const [isAnimationReady, setIsAnimationReady] = useState(false);

  useEffect(() => {
    // This effect now depends on the theme, and will re-run when it changes.
    const containerId = 'box';

    let container = document.getElementById(containerId);
    if (!container) {
      console.error('Container element for background not found.');
      return;
    }
    
    // Clear previous canvas if it exists, to prevent multiple canvases from running
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    // Determine script and colors based on theme
    const isDarkMode = theme === 'dark';
    const scriptSrc = isDarkMode ? '/AestheticFluidBg2.min.js' : '/AestheticFluidBg.min.js';
    const colors = isDarkMode
      ? ["#001533","#131249","#000000","#000000","#212832","#090e1a"]
      : ["#ff7300","#ffffff","#ededed","#0055ff","#ffffff","#ffffff"];

    const mainScriptId = 'ambient-light-bg-script';
    const initScriptId = 'ambient-light-init-script';
    
    // Clean up old scripts before adding new ones
    const existingMainScript = document.getElementById(mainScriptId);
    if (existingMainScript && existingMainScript.parentNode) {
      existingMainScript.parentNode.removeChild(existingMainScript);
    }
    const existingInitScript = document.getElementById(initScriptId);
    if (existingInitScript && existingInitScript.parentNode) {
      existingInitScript.parentNode.removeChild(existingInitScript);
    }
    
    const mainScript = document.createElement('script');
    mainScript.id = mainScriptId;
    mainScript.src = scriptSrc;
    mainScript.async = true;

    mainScript.onload = () => {
      const initScript = document.createElement('script');
      initScript.id = initScriptId;
      initScript.innerHTML = `
        try {
          if (window.Color4Bg && typeof window.Color4Bg.AestheticFluidBg === 'function') {
            new window.Color4Bg.AestheticFluidBg({
              dom: "${containerId}",
              colors: ${JSON.stringify(colors)},
              loop: true,
              gauss: 0.24
            });
            window.dispatchEvent(new Event('backgroundReady'));
          } else {
              console.error('AestheticFluidBg library not found on window.Color4Bg');
          }
        } catch (error) {
          console.error('Error initializing AestheticFluidBg:', error);
        }
      `;
      document.body.appendChild(initScript);
    };
    
    mainScript.onerror = () => {
        console.error(`Failed to load ${scriptSrc} script.`);
    };
    
    const handleBackgroundReady = () => {
        if (onReady) onReady();
        setIsAnimationReady(true);
    };
    window.addEventListener('backgroundReady', handleBackgroundReady);

    document.body.appendChild(mainScript);
   
    return () => {
      window.removeEventListener('backgroundReady', handleBackgroundReady);
      const script1 = document.getElementById(mainScriptId);
      if (script1 && script1.parentNode) {
        script1.parentNode.removeChild(script1);
      }
      const script2 = document.getElementById(initScriptId);
        if (script2 && script2.parentNode) {
        script2.parentNode.removeChild(script2);
      }
    };
  }, [theme, onReady]);

  return (
    <div className="relative w-full h-full">
        {/* Static placeholder background - updated to use a dark color that fits both themes */}
        <div className={cn(
            "absolute inset-0 z-0 bg-[#00001a] transition-opacity duration-1000 ease-in-out",
            isAnimationReady ? 'opacity-0' : 'opacity-100'
        )} />
        {/* Dynamic background container */}
        <div id="box" className={cn(
            "absolute inset-0 z-10 transition-opacity duration-1000 ease-in-out",
            isAnimationReady ? 'opacity-100' : 'opacity-0'
        )} />
    </div>
  );
};

export default AestheticFluidBackground;
