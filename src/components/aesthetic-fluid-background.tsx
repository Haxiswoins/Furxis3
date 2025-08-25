
'use client';

import { useEffect } from 'react';

declare const Color4Bg: any;

export function AestheticFluidBackground() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/scripts/AestheticFluidBg.js';
    script.async = true;

    script.onload = () => {
      // Ensure the library is loaded before trying to use it
      if (typeof Color4Bg !== 'undefined' && typeof Color4Bg.AestheticFluidBg === 'function') {
        new Color4Bg.AestheticFluidBg({
          dom: "box",
          colors: ["#efefef", "#e8e8e8", "#ffffff", "#f0f0f0", "#efefef", "#e8e8e8"],
          loop: true
        });
      }
    };

    document.body.appendChild(script);

    // Cleanup function to remove the script when the component unmounts
    return () => {
      document.body.removeChild(script);
      const boxElement = document.getElementById('box');
      if (boxElement) {
        boxElement.innerHTML = '';
      }
    };
  }, []);

  return <div id="box" className="absolute inset-0 w-full h-full z-0" />;
}
