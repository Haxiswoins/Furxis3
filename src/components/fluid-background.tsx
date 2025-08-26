
'use client';

import { useEffect, useRef } from 'react';
// @ts-ignore
import { AestheticFluidBg } from '@/lib/AestheticFluidBg.module.js';

export function FluidBackground() {
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) {
            return;
        }

        // Check if the canvas element exists
        const canvas = document.getElementById('box');
        if (!canvas) {
            console.error('Canvas element with id "box" not found.');
            return;
        }

        try {
            new AestheticFluidBg({
                dom: "box",
                colors: ["#ff5900","#F0FFFE","#194294","#F0FFFE","#58b3c6","#F0FFFE"],
                loop: true
            });
            initialized.current = true;
        } catch (e) {
            console.error('AestheticFluidBg Initialization Error:', e);
        }

    }, []);

    return (
        <canvas 
            id="box" 
            className="fixed top-0 left-0 w-full h-full z-[-1]"
        />
    );
}
