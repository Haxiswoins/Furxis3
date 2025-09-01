
'use client';

import Script from 'next/script';
import { memo } from 'react';

// This component is memoized to prevent re-renders,
// which could cause the script to load multiple times.
export const AmbientLightBackground = memo(function AmbientLightBackground() {
  const initializeBackground = () => {
      try {
        if (window.Color4Bg && window.Color4Bg.CurveGradientBg) {
            new window.Color4Bg.CurveGradientBg({
                dom: "box",
                colors: ["#007FFE","#3099FE","#60B2FE","#90CCFE","#C0E5FE","#F0FFFE"],
                loop: true
            });
        } else {
            console.error('AmbientLightBg script loaded, but Color4Bg object not found on window.');
        }
      } catch (error) {
        console.error('Failed to initialize AmbientLightBg:', error);
      }
  };
  
  return (
    <Script
        src="/AmbientLightBg.js"
        strategy="lazyOnload"
        onLoad={initializeBackground}
        onError={(e) => {
            console.error('Failed to load AmbientLightBg script:', e);
        }}
    />
  );
});
