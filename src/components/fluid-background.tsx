
'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    Color4Bg: any;
  }
}

export function FluidBackground() {
  // We no longer need the ref to pass to the library,
  // but it's good practice if we ever need to manipulate the canvas from React.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const CANVAS_ID = "fluid-background-canvas";

  const handleScriptLoad = () => {
    if (typeof window.Color4Bg !== 'undefined' && document.getElementById(CANVAS_ID)) {
        new window.Color4Bg.AestheticFluidBg({
            dom: CANVAS_ID, // Pass the ID string, not the element object
            colors: ["#ff5900","#F0FFFE","#194294","#F0FFFE","#58b3c6","#F0FFFE"],
            loop: true
        });
    }
  };

  return (
    <>
      {/* Add the id attribute to the canvas */}
      <canvas id={CANVAS_ID} ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-[9999]"></canvas>
      <Script
        src="/AestheticFluidBg.min.js"
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
      />
    </>
  );
}
