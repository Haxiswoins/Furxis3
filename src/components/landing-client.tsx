
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as THREE from 'three';

export function LandingPageClient() {
  const router = useRouter();
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isInitialAnimationDone, setIsInitialAnimationDone] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  // Timer for initial "The Stars Arriving" text fade out
  useEffect(() => {
    const contentTimer = setTimeout(() => {
      setIsContentVisible(true);
    }, 3000);

    const animationTimer = setTimeout(() => {
      setIsInitialAnimationDone(true);
    }, 2500);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(animationTimer);
    };
  }, []);

  // Three.js animation effect
  useEffect(() => {
    if (!canvasRef.current) return;

    let animationFrameId: number;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 1;
    camera.rotation.x = Math.PI / 2;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const starCount = 6000;
    const positions = new Float32Array(starCount * 3);
    const geometry = new THREE.BufferGeometry();

    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 50;
        positions[i3 + 1] = (Math.random() - 0.5) * 50;
        positions[i3 + 2] = Math.random() * -1000;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.03,
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending,
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();

      if (isWarping) {
        stars.material.size = 0.01;
        stars.position.z += delta * 250;
      } else {
        stars.material.size = 0.03;
        stars.position.z += delta * 0.2;
      }
      
      if (stars.position.z > camera.position.z) {
        stars.position.z = -1000;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [isWarping]); // Re-run effect if isWarping changes to adjust speed

  const handleWarp = () => {
    setIsWarping(true);
    setTimeout(() => {
      router.push('/home');
    }, 1200); // Animation duration before navigation
  };
  
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* WebGL Starfield Canvas */}
      <canvas ref={canvasRef} className={cn("absolute inset-0 z-0 transition-opacity duration-1000", isWarping ? "opacity-30" : "opacity-100")}></canvas>
      
       {/* Warp Tunnel Effect */}
      <div className={cn(
        "pointer-events-none fixed inset-0 z-10",
        "bg-[radial-gradient(ellipse_at_center,_transparent_40%,_black_90%)]",
        "transition-all duration-500 ease-in-out",
        isWarping ? "opacity-100 scale-150" : "opacity-0 scale-100"
      )}></div>

       {/* White Flash Effect */}
      <div className={cn(
        "pointer-events-none fixed inset-0 z-40 bg-white",
        "transition-opacity duration-300 ease-in-out",
         isWarping ? "opacity-100" : "opacity-0"
      )}></div>

      {/* Initial Loading Text Overlay */}
      <div
        className={cn(
          'absolute inset-0 z-30 flex flex-col items-center justify-center text-white transition-opacity duration-1000',
          isInitialAnimationDone || isWarping ? 'opacity-0' : 'opacity-100',
          'pointer-events-none'
        )}
      >
         <h1 className="font-headline text-3xl tracking-widest animate-pulse">The Stars Arriving</h1>
      </div>
      
      {/* Main Content (Enter button) */}
       <div
        className={cn(
          'absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-1000',
          (isContentVisible && !isWarping) ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="absolute top-1/2 -translate-y-1/2">
          <button
            onClick={handleWarp}
            aria-label="进入网站"
            className="group relative flex h-28 w-28 items-center justify-center rounded-full border border-primary/50 bg-black/30 text-white transition-all duration-300 ease-in-out hover:scale-110 hover:border-primary hover:shadow-[0_0_35px_rgba(255,97,47,0.7)] active:scale-100 backdrop-blur-sm"
          >
            <div className="absolute inset-0 rounded-full border-2 border-white/20 scale-125 group-hover:scale-150 group-hover:opacity-0 transition-all duration-500 animate-pulse"></div>
            <Rocket className="h-14 w-14 text-primary/80 transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1 group-hover:scale-110" />
          </button>
        </div>
      </div>
    </div>
  );
}
