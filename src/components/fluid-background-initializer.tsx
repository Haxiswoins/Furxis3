
'use client';

import Script from 'next/script';

export function FluidBackgroundInitializer() {
    const initScript = `
        if (typeof window.Color4Bg !== 'undefined' && typeof window.Color4Bg.AestheticFluidBg === 'function') {
          try {
            new window.Color4Bg.AestheticFluidBg({
              dom: "box",
              colors: ["#ff6600","#F0FFFE","#3069a1","#F0FFFE","#83e5ec","#F0FFFE"],
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
