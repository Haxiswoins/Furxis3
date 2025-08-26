
'use client';

import { useEffect, useRef }from 'react';

// This component now handles the dynamic loading and initialization 
// of the non-module, script-based AestheticFluidBg.js library.

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scriptLoaded = useRef(false);
  const CANVAS_ID = "fluid-background-canvas";

  useEffect(() => {
    // Ensure this effect runs only once.
    if (scriptLoaded.current || !canvasRef.current) {
        return;
    }

    const initFluidBg = () => {
        // @ts-ignore - We are accessing a global library loaded via script tag
        if (window.Color4Bg && typeof window.Color4Bg.AestheticFluidBg === 'function') {
             // @ts-ignore
            new window.Color4Bg.AestheticFluidBg({
                dom: CANVAS_ID, // Pass the ID string as expected by the library
                colors: ["#ff5900","#F0FFFE","#194294","#F0FFFE","#58b3c6","#F0FFFE"],
                loop: true
            });
        } else {
            console.error("AestheticFluidBg library not loaded correctly.");
        }
    };

    // Check if the script is already on the page
    // @ts-ignore
    if (window.Color4Bg) {
        initFluidBg();
        scriptLoaded.current = true;
        return;
    }

    // If not, create and inject the script tag
    const script = document.createElement('script');
    script.src = '/AestheticFluidBg.js'; // Assumes the file is in the /public directory
    script.async = true;
    
    script.onload = () => {
        initFluidBg();
        scriptLoaded.current = true;
    };

    script.onerror = () => {
        console.error("Failed to load the AestheticFluidBg.js script.");
    };

    document.body.appendChild(script);

    // Basic cleanup
    return () => {
      try {
        if(script.parentNode) {
            script.parentNode.removeChild(script);
        }
      } catch (e) {
          // ignore
      }
    };
  }, []); 

  return (
    <canvas 
      id={CANVAS_ID} 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full z-[-1]"
    ></canvas>
  );
}
