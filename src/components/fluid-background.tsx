
'use client';

import { useEffect, useRef }from 'react';
// @ts-ignore
import { AestheticFluidBg } from '@/lib/AestheticFluidBg.js';

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const CANVAS_ID = "fluid-background-canvas";

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    // The canvas element is guaranteed to be in the DOM at this point.
    let fluidBgInstance: any = null;

    if (document.getElementById(CANVAS_ID)) {
      fluidBgInstance = new AestheticFluidBg({
          dom: CANVAS_ID, // Pass the ID string
          colors: ["#ff5900","#F0FFFE","#194294","#F0FFFE","#58b3c6","#F0FFFE"],
          loop: true
      });
    }
    
    // Cleanup function to destroy the instance when the component unmounts
    return () => {
      if (fluidBgInstance && typeof fluidBgInstance.destroy === 'function') {
        fluidBgInstance.destroy();
      }
    }
  }, []); // Empty dependency array ensures this runs only once.

  return (
    // The canvas is now part of this component, ensuring it exists before the effect runs.
    // It's positioned to cover the entire screen and sit in the background.
    <canvas 
      id={CANVAS_ID} 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full z-[-1]"
    ></canvas>
  );
}
