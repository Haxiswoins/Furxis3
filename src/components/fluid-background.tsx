
'use client';

import { useEffect, useRef } from 'react';

export function FluidBackground() {
    const initialized = useRef(false);

    useEffect(() => {
        // Ensure this effect runs only once.
        if (initialized.current) {
            return;
        }
        initialized.current = true;
        
        // Function to load a script and return a promise
        const loadScript = (src: string, id: string, isModule = false) => {
            return new Promise<void>((resolve, reject) => {
                if (document.getElementById(id)) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.id = id;
                if (isModule) {
                    script.type = 'module';
                }
                script.src = src;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
                document.body.appendChild(script);
            });
        };

        // Chain the loading of scripts
        loadScript(
            "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
            "three-js-script"
        ).then(() => {
            return loadScript("/AestheticFluidBg.min.js", "color4bg-script");
        }).then(() => {
            // @ts-ignore
            if (window.Color4Bg && typeof window.Color4Bg.AestheticFluidBg === 'function') {
                try {
                     // @ts-ignore
                    new window.Color4Bg.AestheticFluidBg({
                        dom: "box",
                        colors: ["#ff6600","#F0FFFE","#3069a1","#F0FFFE","#83e5ec","#F0FFFE"],
                        loop: true
                    });
                } catch (e) {
                    console.error('AestheticFluidBg Initialization Error:', e);
                }
            } else {
                console.error('Color4Bg library not found on window object after script load.');
            }
        }).catch(error => {
            console.error(error);
        });

    }, []);

    return (
        <canvas 
            id="box" 
            className="fixed top-0 left-0 w-full h-full z-[-1]"
        />
    );
}
