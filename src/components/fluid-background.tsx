
'use client';

import Script from 'next/script';
import { memo } from 'react';

// This component is memoized to prevent re-renders,
// which could cause the script to load multiple times.
export const FluidBackground = memo(function FluidBackground() {
  return (
    <>
      <div 
        id="box" 
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
        }}
      />
      <Script
        src="/AestheticFluidBg.min.js"
        strategy="lazyOnload"
        onLoad={() => {
          try {
            // The script from color4bg.com attaches its main class to window.Color4Bg
            if (window.Color4Bg && window.Color4Bg.AestheticFluidBg) {
               new window.Color4Bg.AestheticFluidBg({
                dom: "box",
                colors: ["#ff6600","#F0FFFE","#3069a1","#F0FFFE","#83e5ec","#F0FFFE"],
                loop: true
              });
            } else {
              console.error('AestheticFluidBg script loaded, but Color4Bg object not found on window.');
            }
          } catch (error) {
            console.error('Failed to initialize AestheticFluidBg:', error);
          }
        }}
        onError={(e) => {
            console.error('Failed to load AestheticFluidBg script:', e);
        }}
      />
    </>
  );
});

// Define the custom type on the Window interface
declare global {
    interface Window {
        Color4Bg?: {
            AestheticFluidBg: new (options: {
                dom: string,
                colors: string[],
                loop: boolean
            }) => any;
        }
    }
}
