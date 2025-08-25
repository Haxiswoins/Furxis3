
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
    if (document.getElementById(mainScriptId)) {
      return;
    }

    // Main library script
    const mainScript = document.createElement('script');
    mainScript.id = mainScriptId;
    mainScript.src = '/AmbientLightBg.module.js';
    mainScript.type = 'module'; // Treat this script as an ES module
    mainScript.async = true;

    mainScript.onload = () => {
      // The main script has loaded, now we can run the initialization code.
      // We put the initialization logic in its own module script block.
      const initScript = document.createElement('script');
      initScript.id = initScriptId;
      initScript.type = 'module';
      initScript.innerHTML = `
        import { AmbientLightBg } from '/AmbientLightBg.module.js';
        try {
          if (document.getElementById('${containerId}')) {
            new AmbientLightBg({
              dom: "${containerId}",
              colors: ["#ffffff","#ffa200","#ffffff","#ffffff","#406391","#ff6c0a"],
              loop: true
            });
          }
        } catch (error) {
          console.error('Error initializing AmbientLightBg:', error);
        }
      `;
      document.body.appendChild(initScript);
    };
    
    mainScript.onerror = () => {
        console.error('Failed to load AmbientLightBg.module.js script.');
    };

    document.body.appendChild(mainScript);

    // Cleanup function to remove scripts when component unmounts
    return () => {
      const existingMainScript = document.getElementById(mainScriptId);
      if (existingMainScript) {
        document.body.removeChild(existingMainScript);
      }
      const existingInitScript = document.getElementById(initScriptId);
       if (existingInitScript) {
        document.body.removeChild(existingInitScript);
      }
    };
  }, []);

  return <div id="box" className="absolute inset-0 z-0" />;
};

export default AestheticFluidBackground;
