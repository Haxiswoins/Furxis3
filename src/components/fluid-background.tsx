'use client';

import { useEffect } from 'react';
import { AestheticFluidBg } from '@/lib/AestheticFluidBg.module.js';

export function FluidBackground() {
  useEffect(() => {
    let colorbg: any = null;
    try {
      colorbg = new AestheticFluidBg({
        dom: "box",
        colors: ["#ff6600","#F0FFFE","#3069a1","#F0FFFE","#83e5ec","#F0FFFE"],
        loop: true
      });
    } catch(e) {
      console.error("Failed to initialize fluid background", e);
    }
    
    return () => {
      if (colorbg && typeof colorbg.destroy === 'function') {
        colorbg.destroy();
      }
    }
  }, []);

  return <canvas id="box" className="fixed top-0 left-0 w-full h-full z-[-1]"></canvas>;
}
