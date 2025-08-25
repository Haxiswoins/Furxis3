
'use client';

import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';

type AestheticFluidBackgroundProps = {
  onReady?: () => void;
};

const AestheticFluidBackground = ({ onReady }: AestheticFluidBackgroundProps) => {
  const { theme } = useTheme();
  const [isAnimationReady, setIsAnimationReady] = useState(false);

  useEffect(() => {
    const containerId = 'box';
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Container element for background not found.');
      return;
    }

    const isDarkMode = theme === 'dark';

    // Configuration based on theme
    const scriptSrc = isDarkMode ? '/AmbientLightBg.min.js' : '/AestheticFluidBg.min.js';
    const colors = isDarkMode
      ? ["#1C1450","#332D71","#7D709A","#1E5286","#143671","#031D34"]
      : ["#ff7300","#ffffff","#ededed","#0d2868","#ffffff","#ffffff"];
    const gaussValue = 0.1; // Only for AestheticFluidBg

    const mainScriptId = 'ambient-light-bg-script';
    const initScriptId = 'ambient-light-init-script';
    
    let isCancelled = false;

    const cleanup = () => {
        // Clear previous canvas if it exists
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        const script1 = document.getElementById(mainScriptId);
        if (script1 && script1.parentNode) {
            script1.parentNode.removeChild(script1);
        }
        const script2 = document.getElementById(initScriptId);
        if (script2 && script2.parentNode) {
            script2.parentNode.removeChild(script2);
        }
        window.removeEventListener('backgroundReady', handleBackgroundReady);
    };
    
    const handleBackgroundReady = () => {
        if (!isCancelled) {
          if (onReady) onReady();
          setIsAnimationReady(true);
        }
    };
    
    const mainScript = document.createElement('script');
    mainScript.id = mainScriptId;
    mainScript.src = scriptSrc;
    mainScript.async = true;

    mainScript.onload = () => {
        if (isCancelled) return;

        const initScript = document.createElement('script');
        initScript.id = initScriptId;
        
        if (isDarkMode) {
            initScript.innerHTML = `
                try {
                  if (window.Color4Bg && typeof window.Color4Bg.AmbientLightBg === 'function') {
                    new window.Color4Bg.AmbientLightBg({
                      dom: "${containerId}",
                      colors: ${JSON.stringify(colors)},
                      loop: true
                    });
                    window.dispatchEvent(new Event('backgroundReady'));
                  } else {
                      console.error('AmbientLightBg library not found on window.Color4Bg');
                  }
                } catch (error) {
                  console.error('Error initializing AmbientLightBg:', error);
                }
            `;
        } else {
            initScript.innerHTML = `
                try {
                  if (window.Color4Bg && typeof window.Color4Bg.AestheticFluidBg === 'function') {
                    new window.Color4Bg.AestheticFluidBg({
                      dom: "${containerId}",
                      colors: ${JSON.stringify(colors)},
                      loop: true,
                      gauss: ${gaussValue}
                    });
                    window.dispatchEvent(new Event('backgroundReady'));
                  } else {
                      console.error('AestheticFluidBg library not found on window.Color4Bg');
                  }
                } catch (error) {
                  console.error('Error initializing AestheticFluidBg:', error);
                }
            `;
        }
        
        document.body.appendChild(initScript);
    };
    
    mainScript.onerror = () => {
        if (isCancelled) return;
        console.error(`Failed to load ${scriptSrc} script.`);
    };
    
    // Clean up previous instances before adding new ones
    cleanup();
    
    window.addEventListener('backgroundReady', handleBackgroundReady);
    document.body.appendChild(mainScript);
   
    return () => {
      isCancelled = true;
      cleanup();
    };
  }, [theme, onReady]);

  return (
    <div className="relative w-full h-full">
        {/* Static placeholder background - matches dark theme */}
        <div className={cn(
            "absolute inset-0 z-0 bg-background transition-opacity duration-1000 ease-in-out",
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
