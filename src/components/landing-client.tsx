
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as THREE from 'three';

export function LandingPageClient() {
  const router = useRouter();
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const contentTimer = setTimeout(() => {
      setIsContentVisible(true);
    }, 2500);

    return () => {
      clearTimeout(contentTimer);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    let animationFrameId: number;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const starCount = 3000;
    const positions = new Float32Array(starCount * 3);
    const starInfo = new Float32Array(starCount); // To store random phase for drift
    
    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 100;
        positions[i3 + 1] = (Math.random() - 0.5) * 100;
        positions[i3 + 2] = (Math.random() - 0.5) * 1000;
        starInfo[i] = Math.random() * Math.PI * 2;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(starInfo, 1));

    const material = new THREE.PointsMaterial({
        size: 0.05,
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
    });

    const stars = new THREE.Points(geometry, material);
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
      
      // Particle movement logic for drift
      const positions = stars.geometry.attributes.position.array as Float32Array;
      const randoms = stars.geometry.attributes.aRandom.array as Float32Array;
      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        positions[i3] += Math.sin(elapsedTime * 0.1 + randoms[i]) * 0.001;
        positions[i3 + 1] += Math.cos(elapsedTime * 0.1 + randoms[i]) * 0.001;
      }
      stars.geometry.attributes.position.needsUpdate = true;
      
      // Parallax effect based on mouse
      scene.rotation.y += (mouse.current.x * 0.1 - scene.rotation.y) * 0.05;
      scene.rotation.x += (-mouse.current.y * 0.1 - scene.rotation.x) * 0.05;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  const handleNavigate = () => {
    setIsExiting(true);
    setTimeout(() => {
      router.push('/home');
    }, 1000); // Wait for fade-out animation
  };
  
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 z-0"></canvas>
      
      <div className={cn(
        "absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-1000",
        isContentVisible ? 'opacity-100' : 'opacity-0',
        isExiting ? 'opacity-0' : 'opacity-100'
      )}>
        <div className="absolute top-1/2 -translate-y-1/2">
          <button
            onClick={handleNavigate}
            aria-label="进入网站"
            className="group relative flex h-28 w-28 items-center justify-center rounded-full border border-primary/50 bg-black/30 text-white transition-all duration-300 ease-in-out hover:scale-110 hover:border-primary hover:shadow-[0_0_35px_rgba(255,97,47,0.7)] active:scale-100 backdrop-blur-sm"
          >
            <div className="absolute inset-0 rounded-full border-2 border-white/20 scale-125 group-hover:scale-150 group-hover:opacity-0 transition-all duration-500 animate-pulse"></div>
            <Rocket className="h-14 w-14 text-primary/80 transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1 group-hover:scale-110" />
          </button>
        </div>
      </div>

      <div className={cn(
        "absolute bottom-8 w-full text-center text-xs text-white/40 transition-opacity duration-1000 ease-in-out",
        isContentVisible && !isExiting ? "opacity-100" : "opacity-0"
      )}>
         <p>Developed by Haxis</p>
      </div>

    </div>
  );
}
