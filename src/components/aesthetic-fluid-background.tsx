

'use client';

import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        Color4Bg?: any;
    }
}

export function AmbientLightBackground() {
    const scriptLoaded = useRef(false);

    useEffect(() => {
        // Ensure this logic only runs on the client and only once.
        if (typeof window === 'undefined' || scriptLoaded.current) {
            return;
        }

        const script = document.createElement('script');
        script.src = '/AmbientLightBg.module.js';
        script.async = true;

        script.onload = () => {
            if (window.Color4Bg && typeof window.Color4Bg.AmbientLightBg === 'function') {
                try {
                    new window.Color4Bg.AmbientLightBg({
                        dom: "box",
                        colors: ["#00023E","#ff7b00","#204299","#132385","#0C0D62","#00023E"],
                        loop: true
                    });
                } catch (e) {
                    console.error('AmbientLightBg Initialization Error:', e);
                }
            } else {
                 console.error('AmbientLightBg library not found on window object after script load.');
            }
        };

        script.onerror = () => {
            console.error('Failed to load the AmbientLightBg.module.js script.');
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
            className="fixed top-0 left-0 w-full h-full z-[-1]"
        />
    );
}
