
'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    Color4Bg: any;
  }
}

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleScriptLoad = () => {
    if (typeof window.Color4Bg !== 'undefined' && canvasRef.current) {
        new window.Color4Bg.AestheticFluidBg({
            dom: canvasRef.current, // Directly pass the canvas element
            colors: ["#ff5900","#F0FFFE","#194294","#F0FFFE","#58b3c6","#F0FFFE"],
            loop: true
        });
    }
  };

  return (
    <>
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-[9999]"></canvas>
      <Script
        src="/AestheticFluidBg.min.js"
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
      />
    </>
  );
}
