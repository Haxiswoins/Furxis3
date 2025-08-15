
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as THREE from 'three';

export function LandingPageClient() {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isInitialAnimationDone, setIsInitialAnimationDone] = useState(false);
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
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Starfield
    const starVertices: number[] = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        transparent: true,
        opacity: 0.8,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);


    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (event: MouseEvent) => {
        mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const clock = new THREE.Clock();
    
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      // Animate stars
      stars.position.z += elapsedTime * 0.002;
      if (stars.position.z > 1000) stars.position.z = -1000;

      // Make camera react to mouse movement
      camera.position.x += (mouse.current.x * 2 - camera.position.x) * 0.02;
      camera.position.y += (mouse.current.y * 2 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      starGeometry.dispose();
      starMaterial.dispose();
      renderer.dispose();
    };
  }, []);
  
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* WebGL Starfield Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0"></canvas>
      
      {/* Initial Loading Text Overlay */}
      <div
        className={cn(
          'absolute inset-0 z-30 flex flex-col items-center justify-center text-white transition-opacity duration-1000',
          isInitialAnimationDone ? 'opacity-0' : 'opacity-100',
          'pointer-events-none'
        )}
      >
         <h1 className="font-headline text-3xl tracking-widest animate-pulse">The Stars Arriving</h1>
      </div>
      
      {/* Main Content (Enter button) */}
       <div
        className={cn(
          'absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-1000',
          isContentVisible ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="absolute top-1/2 -translate-y-1/2">
          <Link href="/home" passHref>
            <button
              aria-label="进入网站"
              className="group relative flex h-28 w-28 items-center justify-center rounded-full border border-primary/50 bg-black/30 text-white transition-all duration-300 ease-in-out hover:scale-110 hover:border-primary hover:shadow-[0_0_35px_rgba(255,97,47,0.7)] active:scale-100 backdrop-blur-sm"
            >
              <div className="absolute inset-0 rounded-full border-2 border-white/20 scale-125 group-hover:scale-150 group-hover:opacity-0 transition-all duration-500 animate-pulse"></div>
              <Rocket className="h-14 w-14 text-primary/80 transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1 group-hover:scale-110" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
