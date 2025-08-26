
'use client';

import { useEffect, useRef }from 'react';

// This component handles the dynamic loading and initialization 
// of the script-based AestheticFluidBg.js library in a way that is
// safe for Next.js environments.

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Use a ref to ensure the script is only loaded once per component lifecycle.
  const scriptLoaded = useRef(false);
  const CANVAS_ID = "fluid-background-canvas";

  useEffect(() => {
    // Exit if the script has already been loaded or if the canvas element is not yet available.
    if (scriptLoaded.current || !canvasRef.current) {
        return;
    }

    const initFluidBg = () => {
        // @ts-ignore - We are accessing a global library loaded via a script tag.
        // Check if the library's main object is available on the window.
        if (window.Color4Bg && typeof window.Color4Bg.AestheticFluidBg === 'function') {
             // @ts-ignore
            new window.Color4Bg.AestheticFluidBg({
                dom: CANVAS_ID, // Pass the canvas ID string as expected by the library
                colors: ["#ff5900","#F0FFFE","#194294","#F0FFFE","#58b3c6","#F0FFFE"],
                loop: true
            });
        } else {
            console.error("AestheticFluidBg library is not available on the window object.");
        }
    };

    // Check if another instance of this component has already loaded the script.
    // @ts-ignore
    if (window.Color4Bg) {
        initFluidBg();
        scriptLoaded.current = true;
        return;
    }

    // If the script is not yet on the page, create and inject it.
    const script = document.createElement('script');
    script.src = '/AestheticFluidBg.js'; // Assumes the file is in the /public directory
    script.async = true;
    
    // Set the onload event handler to initialize the background *after* the script has loaded.
    script.onload = () => {
        initFluidBg();
        scriptLoaded.current = true; // Mark the script as loaded.
    };

    script.onerror = () => {
        console.error("Failed to load the AestheticFluidBg.js script.");
    };

    document.body.appendChild(script);

    // Return a cleanup function to remove the script if the component unmounts.
    return () => {
      try {
        if(script.parentNode) {
            script.parentNode.removeChild(script);
        }
      } catch (e) {
          // It's possible the script is already gone, so we can ignore errors here.
      }
    };
  }, []); // The empty dependency array ensures this effect runs only once on mount.

  return (
    <canvas 
      id={CANVAS_ID} 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full z-[-1]"
    ></canvas>
  );
}
