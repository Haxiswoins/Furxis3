
'use client';

import { useEffect } from 'react';

type AestheticFluidBackgroundProps = {
  onReady?: () => void;
};

const AestheticFluidBackground = ({ onReady }: AestheticFluidBackgroundProps) => {
  useEffect(() => {
    const containerId = 'box';

    // Ensure the container div exists
    let container = document.getElementById(containerId);
    if (!container) {
      console.error('Container element for background not found.');
      return;
    }

    const mainScriptId = 'ambient-light-bg-script';
    const initScriptId = 'ambient-light-init-script';
    
    // Avoid appending the script multiple times
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
    // Load the new script provided by the user
    mainScript.src = '/AestheticFluidBg.min.js';
    mainScript.async = true;

    mainScript.onload = () => {
      // The main script has loaded, now we can run the initialization code.
      const initScript = document.createElement('script');
      initScript.id = initScriptId;
      initScript.innerHTML = `
        try {
          if (window.Color4Bg && typeof window.Color4Bg.AestheticFluidBg === 'function') {
            new window.Color4Bg.AestheticFluidBg({
              dom: "${containerId}",
              colors: ["#ffffff","#ffffff","#004fa3","#ffffff","#ff6600","#ffffff"],
              loop: true,
              gauss: 0.24
            });
            // Signal that the background is ready
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
        console.error('Failed to load AestheticFluidBg.min.js script.');
    };
    
    // Listen for the custom event to call the onReady callback
    const handleBackgroundReady = () => {
        if (onReady) {
            onReady();
        }
    };
    window.addEventListener('backgroundReady', handleBackgroundReady);

    document.body.appendChild(mainScript);
   
    // Cleanup function to remove scripts and event listener when component unmounts
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
  }, [onReady]);

  return <div id="box" className="absolute inset-0 z-0" />;
};

export default AestheticFluidBackground;
