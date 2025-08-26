
'use client';

import { useEffect, useRef } from 'react';

export function FluidBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        // This is now empty as we have removed the Three.js galaxy effect.
        // It is ready for the new effect to be implemented.
    }, []);

    return (
        <canvas 
            id="fluid-background-canvas"
            ref={canvasRef} 
            className="fixed top-0 left-0 w-full h-full z-[-1]"
        />
    );
}
