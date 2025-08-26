
'use client';

import Script from 'next/script';

declare global {
  interface Window {
    Color4Bg: any;
  }
}

export function FluidBackground() {
  const handleScriptLoad = () => {
    if (typeof window.Color4Bg !== 'undefined') {
      new window.Color4Bg.AestheticFluidBg({
        dom: "fluid-background-box",
        colors: ["#ff5900","#F0FFFE","#194294","#F0FFFE","#58b3c6","#F0FFFE"],
        loop: true
      });
    }
  };

  return (
    <Script
      src="/AestheticFluidBg.min.js"
      strategy="lazyOnload"
      onLoad={handleScriptLoad}
    />
  );
}
