'use client';

import { useEffect, useRef } from 'react';
// @ts-ignore
import { AestheticFluidBg } from '@/lib/AestheticFluidBg.module.js';

export default function TestBackgroundPage() {
    const initialized = useRef(false);

    useEffect(() => {
        // Ensure this runs only once
        if (initialized.current) {
            return;
        }
        initialized.current = true;

        // Check if the library is loaded and the canvas element exists
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
        } catch (e) {
            console.error('AestheticFluidBg Initialization Error:', e);
        }

    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <canvas 
                id="box" 
                style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%',
                }}
            />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', zIndex: 10, fontSize: '2rem', background: 'rgba(0,0,0,0.5)', padding: '1rem' }}>
                Test Page
            </div>
        </div>
    );
}
