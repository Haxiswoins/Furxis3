
'use client';

import { useEffect } from 'react';

const AestheticFluidBackground = () => {
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
    // Directly load the script from the official source to ensure consistency
    mainScript.src = 'https://www.color4bg.com/script/AmbientLightBg.min.js';
    mainScript.async = true;

    mainScript.onload = () => {
      // The main script has loaded, now we can run the initialization code.
      const initScript = document.createElement('script');
      initScript.id = initScriptId;
      initScript.innerHTML = `
        try {
          if (window.Color4Bg && typeof window.Color4Bg.AmbientLightBg === 'function') {
            new window.Color4Bg.AmbientLightBg({
              dom: "${containerId}",
              colors: ["#000000","#ffa200","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ff6c0a"],
              loop: true,
              speed: 1,
              st_scale: 1,
              curl_scale: 0.2,
              darkness: 1,
              brightness: 0.2,
            });
          } else {
              console.error('AmbientLightBg library not found on window.Color4Bg');
          }
        } catch (error) {
          console.error('Error initializing AmbientLightBg:', error);
        }
      `;
      document.body.appendChild(initScript);
    };
    
    mainScript.onerror = () => {
        console.error('Failed to load AmbientLightBg.min.js script.');
    };

    document.body.appendChild(mainScript);
   
    // Cleanup function to remove scripts when component unmounts
    return () => {
      const script1 = document.getElementById(mainScriptId);
      if (script1 && script1.parentNode) {
        script1.parentNode.removeChild(script1);
      }
      const script2 = document.getElementById(initScriptId);
        if (script2 && script2.parentNode) {
        script2.parentNode.removeChild(script2);
      }
    };
  }, []);

  return <div id="box" className="absolute inset-0 z-0" />;
};

export default AestheticFluidBackground;
