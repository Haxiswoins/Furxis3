
'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

export function FluidBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  const initializeFluid = () => {
    if (isInitialized.current || !containerRef.current) return;
    
    // Check if the necessary objects are available on the window
    if ((window as any).Color4Bg && (window as any).THREE) {
      try {
        new (window as any).Color4Bg.AestheticFluidBg({
          dom: containerRef.current, // Use the ref to target the specific div
          colors: ["#ff6600","#F0FFFE","#304ca1","#F0FFFE","#d3e0ee","#F0FFFE"],
          loop: true
        });
        isInitialized.current = true;
      } catch (error) {
        console.error("Failed to initialize fluid background:", error);
      }
    }
  };

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        strategy="lazyOnload"
        onLoad={() => {
          initializeFluid();
        }}
      />
      <Script
        src="/AestheticFluidBg.min.js"
        strategy="lazyOnload"
        onLoad={() => {
          initializeFluid();
        }}
      />
      <div
        ref={containerRef}
        className="fixed inset-0 w-screen h-screen z-0"
      ></div>
    </>
  );
}
