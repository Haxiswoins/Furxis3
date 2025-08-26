
'use client';

import { useEffect, useRef } from 'react';

export function FluidBackground() {
    const initialized = useRef(false);

    useEffect(() => {
        // Ensure this effect runs only once.
        if (initialized.current || document.getElementById('aesthetic-fluid-bg-script')) {
            return;
        }
        initialized.current = true;

        const script = document.createElement('script');
        script.id = 'aesthetic-fluid-bg-script';
        // This is the key fix: tell the browser to treat this script as an ES module.
        script.type = 'module'; 
        script.src = '/AestheticFluidBg.module.js'; // Assumes the file is in the /public folder
        
        script.onload = () => {
            // @ts-ignore
            if (window.Color4Bg && typeof window.Color4Bg.AestheticFluidBg === 'function') {
                try {
                    // @ts-ignore
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
            console.error('Failed to load the AestheticFluidBg script.');
        };

        document.body.appendChild(script);

        return () => {
            // Cleanup the script when the component unmounts
            const existingScript = document.getElementById('aesthetic-fluid-bg-script');
            if (existingScript) {
                document.body.removeChild(existingScript);
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
