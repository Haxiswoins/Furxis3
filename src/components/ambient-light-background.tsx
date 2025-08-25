'use client';

import { useEffect } from 'react';

declare global {
    interface Window {
        Color4Bg?: {
            AmbientLightBg: new (options: { dom: string; colors: string[]; loop: boolean }) => void;
        };
    }
}

const AestheticFluidBackground = () => {
  useEffect(() => {
    const containerId = 'box';

    // Ensure the container div exists
    let container = document.getElementById(containerId);
    if (!container) {
      console.error('Container element for background not found.');
      return;
    }

    const scriptId = 'ambient-light-bg-script';

    // Avoid appending the script multiple times
    if (document.getElementById(scriptId)) {
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = '/AmbientLightBg.module.js'; // Path from the public directory
    script.async = true;

    script.onload = () => {
      if (window.Color4Bg && typeof window.Color4Bg.AmbientLightBg === 'function') {
        try {
          new window.Color4Bg.AmbientLightBg({
            dom: containerId,
            colors: ["#ffffff","#ffa200","#ffffff","#ffffff","#406391","#ff6c0a"],
            loop: true,
          });
        } catch (error) {
          console.error('Error initializing AmbientLightBg:', error);
        }
      } else {
        console.error('AmbientLightBg script loaded but not found on window.Color4Bg');
      }
    };
    
    script.onerror = () => {
        console.error('Failed to load AmbientLightBg.js script.');
    };

    document.body.appendChild(script);

    // Cleanup function to remove script when component unmounts
    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return <div id="box" className="absolute inset-0 z-0" />;
};

export default AestheticFluidBackground;
