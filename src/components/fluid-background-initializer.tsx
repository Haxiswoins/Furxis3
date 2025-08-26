
'use client';

import Script from 'next/script';

export function FluidBackgroundInitializer() {
    const initScript = `
        if (typeof window.Color4Bg !== 'undefined' && typeof window.Color4Bg.AestheticFluidBg === 'function') {
          try {
            new window.Color4Bg.AestheticFluidBg({
              dom: "box",
              colors: ["#ff5900","#F0FFFE","#194294","#F0FFFE","#58b3c6","#F0FFFE"],
              loop: true
            });
          } catch(e) {
            console.error('AestheticFluidBg Error:', e);
          }
        } else {
           console.error('AestheticFluidBg library not loaded or initialized.');
        }
    `;

    return (
        <Script
            id="fluid-bg-init"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{ __html: initScript }}
        />
    );
}
