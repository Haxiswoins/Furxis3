
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
    }, 500);

    return () => {
      clearTimeout(contentTimer);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    let animationFrameId: number;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const galaxyParameters = {
        count: 50000,
        size: 0.02,
        radius: 15,
        branches: 4,
        spin: 1.5,
        randomness: 0.5,
        randomnessPower: 3,
        insideColor: '#ff6030',
        outsideColor: '#1b3984'
    };

    let geometry: THREE.BufferGeometry | null = null;
    let material: THREE.PointsMaterial | null = null;
    let points: THREE.Points | null = null;
    
    const generateGalaxy = () => {
        if (points) {
            geometry?.dispose();
            material?.dispose();
            scene.remove(points);
        }

        geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(galaxyParameters.count * 3);
        const colors = new Float32Array(galaxyParameters.count * 3);

        const colorInside = new THREE.Color(galaxyParameters.insideColor);
        const colorOutside = new THREE.Color(galaxyParameters.outsideColor);

        for (let i = 0; i < galaxyParameters.count; i++) {
            const i3 = i * 3;
            
            // Position
            const radius = Math.random() * galaxyParameters.radius;
            const spinAngle = radius * galaxyParameters.spin;
            const branchAngle = ((i % galaxyParameters.branches) / galaxyParameters.branches) * Math.PI * 2;

            const randomX = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParameters.randomness * radius;
            const randomY = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParameters.randomness * radius;
            const randomZ = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParameters.randomness * radius;

            positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i3 + 1] = randomY;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
            
            // Color
            const mixedColor = colorInside.clone();
            mixedColor.lerp(colorOutside, radius / galaxyParameters.radius);

            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        material = new THREE.PointsMaterial({
            size: galaxyParameters.size,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });

        points = new THREE.Points(geometry, material);
        points.rotation.x = Math.PI * 0.2; // Tilt the galaxy
        points.position.y = 5; // Move the galaxy up
        scene.add(points);
    }
    
    generateGalaxy();

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
      
      // Animate galaxy
      if(points) {
          points.rotation.y = elapsedTime * 0.05;
      }
      
      // Parallax effect based on mouse
      // Dampen the movement for a smoother effect
      camera.position.x += (mouse.current.x * 0.5 - camera.position.x) * 0.02;
      camera.position.y += (-mouse.current.y * 0.5 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      geometry?.dispose();
      material?.dispose();
      renderer.dispose();
    };
  }, []);

  const handleNavigate = () => {
    setIsExiting(true);
    setTimeout(() => {
      router.push('/home');
    }, 1000); 
  };
  
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 z-0"></canvas>
      
      <div className={cn(
        "absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-1000",
        isContentVisible ? 'opacity-100' : 'opacity-0',
        isExiting ? 'opacity-0' : 'opacity-100'
      )}>
        <div className="absolute bottom-[20%]">
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
