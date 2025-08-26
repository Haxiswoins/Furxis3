
'use client';

import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        Color4Bg?: any;
    }
}

export function FluidBackground() {
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) {
            return;
        }

        const tryInit = () => {
            if (typeof window !== 'undefined' && window.Color4Bg && typeof window.Color4Bg.AestheticFluidBg === 'function') {
                try {
                    new window.Color4Bg.AestheticFluidBg({
                        dom: "box",
                        colors: ["#ff5900","#F0FFFE","#194294","#F0FFFE","#58b3c6","#F0FFFE"],
                        loop: true
                    });
                    initialized.current = true;
                } catch (e) {
                    console.error('AestheticFluidBg Initialization Error:', e);
                }
            } else {
                 // If not ready, try again shortly
                 setTimeout(tryInit, 100);
            }
        };

        tryInit();

    }, []);

    return (
        <canvas 
            id="box" 
            className="fixed top-0 left-0 w-full h-full z-[-1]"
        />
    );
}
