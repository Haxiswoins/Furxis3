
'use client';

import { useEffect } from 'react';

declare global {
    interface Window {
        Color4Bg: any;
    }
}

export function FluidBackground() {
  useEffect(() => {
    let colorbg: any = null;
    
    // Check if the library is loaded
    if (typeof window.Color4Bg !== 'undefined' && typeof window.Color4Bg.AestheticFluidBg === 'function') {
      try {
        colorbg = new window.Color4Bg.AestheticFluidBg({
          dom: "box",
          colors: ["#ff6600","#F0FFFE","#3069a1","#F0FFFE","#83e5ec","#F0FFFE"],
          loop: true
        });
      } catch(e) {
        console.error("Failed to initialize fluid background", e);
      }
    } else {
        console.error("AestheticFluidBg library not loaded.");
    }
    
    return () => {
      // Ensure destroy method exists before calling it
      if (colorbg && typeof colorbg.destroy === 'function') {
        colorbg.destroy();
      }
    }
  }, []);

  return <canvas id="box" className="fixed top-0 left-0 w-full h-full z-[-1]"></canvas>;
}
