
'use client';

import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        Color4Bg?: any;
    }
}

export function AestheticFluidBackground() {
    const scriptLoaded = useRef(false);

    useEffect(() => {
        // Ensure this logic only runs on the client and only once.
        if (typeof window === 'undefined' || scriptLoaded.current) {
            return;
        }

        const script = document.createElement('script');
        script.src = '/AestheticFluidBg.min.js';
        script.async = true;

        script.onload = () => {
            if (window.Color4Bg && typeof window.Color4Bg.AestheticFluidBg === 'function') {
                try {
                    new window.Color4Bg.AestheticFluidBg({
                        dom: "box",
                        colors: ["#ff5900","#F0FFFE","#194294","#F0FFFE","#58b3c6","#F0FFFE"],
                        loop: true
                    });
                } catch (e) {
                    console.error('AestheticFluidBg Initialization Error:', e);
                }
            } else {
                 console.error('AestheticFluidBg library not found on window object after script load.');
            }
        };

        script.onerror = () => {
            console.error('Failed to load the AestheticFluidBg.min.js script.');
        };

        document.body.appendChild(script);
        scriptLoaded.current = true;

        return () => {
            // Optional: Cleanup script from body when component unmounts
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    return (
        <canvas 
            id="box" 
            className="fixed top-0 left-0 w-full h-full"
            style={{ zIndex: 9999 }}
        />
    );
}
