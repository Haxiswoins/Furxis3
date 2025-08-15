
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as THREE from 'three';

const galaxyParameters = {
    count: 50000,
    size: 0.015,
    radius: 15,
    branches: 5,
    spin: 1.5,
    randomness: 0.5,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984'
};


export function LandingPageClient() {
  const router = useRouter();
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const galaxyGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock | null>(null);

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
    
    // Ensure this effect runs only once
    if (rendererRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    let geometry: THREE.BufferGeometry | null = null;
    let material: THREE.PointsMaterial | null = null;
    
    const generateGalaxy = () => {
        if (galaxyGroupRef.current) {
            geometry?.dispose();
            material?.dispose();
            scene.remove(galaxyGroupRef.current);
        }

        const galaxyGroup = new THREE.Group();
        scene.add(galaxyGroup);
        galaxyGroupRef.current = galaxyGroup;
        
        galaxyGroup.position.y = 5;
        galaxyGroup.rotation.x = Math.PI * 0.2; 
        
        geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(galaxyParameters.count * 3);
        const colors = new Float32Array(galaxyParameters.count * 3);
        
        const colorInside = new THREE.Color(galaxyParameters.insideColor);
        const colorOutside = new THREE.Color(galaxyParameters.outsideColor);

        for (let i = 0; i < galaxyParameters.count; i++) {
            const i3 = i * 3;
            const radius = Math.random() * galaxyParameters.radius;
            const spinAngle = radius * galaxyParameters.spin;
            const branchAngle = ((i % galaxyParameters.branches) / galaxyParameters.branches) * Math.PI * 2;

            const randomX = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParameters.randomness * radius;
            const randomY = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParameters.randomness * radius;
            const randomZ = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParameters.randomness * radius;

            positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i3 + 1] = randomY;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
            
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

        const points = new THREE.Points(geometry, material);
        galaxyGroup.add(points);
    }
    
    generateGalaxy();

    const handleResize = () => {
        if (!cameraRef.current || !rendererRef.current) return;
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    
    const handleMouseMove = (event: MouseEvent) => {
        mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    clockRef.current = new THREE.Clock();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
      }
      geometry?.dispose();
      material?.dispose();
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    const clock = clockRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const galaxyGroup = galaxyGroupRef.current;
    let warpFactor = 0;

    const animate = () => {
        if (!clock || !renderer || !scene || !camera || !galaxyGroup) {
            animationFrameIdRef.current = requestAnimationFrame(animate);
            return;
        }

        const elapsedTime = clock.getElapsedTime();

        if (isWarping) {
            warpFactor = Math.min(warpFactor + 0.005, 1); 
            const easedWarp = warpFactor * warpFactor;
            
            // Move camera forward
            camera.position.z -= easedWarp * 0.5;

            const overlay = document.getElementById('warp-overlay');
            if(overlay) {
                 if (warpFactor >= 0.2) {
                     overlay.style.opacity = `${(warpFactor - 0.2) / 0.8}`;
                 }
                 if (camera.position.z <= 0) { // When camera passes the center
                     router.push('/home');
                     return; 
                 }
            }

        } else {
            // Standard rotation and parallax
            (galaxyGroup.children[0] as THREE.Points).rotation.y = elapsedTime * 0.1;
            
            const parallaxX = mouse.current.x * 0.2;
            const parallaxY = -mouse.current.y * 0.2;
            
            camera.position.x += (parallaxX - camera.position.x) * 0.02;
            camera.position.y += (parallaxY - camera.position.y) * 0.02;
        }
        
        camera.lookAt(galaxyGroup.position);
        renderer.render(scene, camera);
        animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
        if(animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
        }
    }
  }, [isWarping, router]);


  const handleNavigate = () => {
    setIsWarping(true);
  };
  
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 z-0"></canvas>
      <div id="warp-overlay" className="absolute inset-0 z-10 bg-white" style={{opacity: 0, pointerEvents: 'none'}}></div>
      
      <div className={cn(
        "absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-1000",
        isContentVisible ? 'opacity-100' : 'opacity-0',
        isWarping ? 'opacity-0' : 'opacity-100'
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
        isContentVisible ? "opacity-100" : "opacity-0",
        isWarping ? 'opacity-0' : 'opacity-100'
      )}>
         <p>Developed by Haxis</p>
      </div>

    </div>
  );
}
