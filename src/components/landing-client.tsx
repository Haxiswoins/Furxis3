
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as THREE from 'three';

export function LandingPageClient() {
  const router = useRouter();
  const [isContentVisible, setIsContentVisible] = useState(false);
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
    let galaxyGroup: THREE.Group | null = null;

    const generateGalaxy = () => {
        if (galaxyGroup) {
            geometry?.dispose();
            material?.dispose();
            scene.remove(galaxyGroup);
        }

        galaxyGroup = new THREE.Group();
        scene.add(galaxyGroup);

        geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(galaxyParameters.count * 3);
        const colors = new Float32Array(galaxyParameters.count * 3);
        const randomness = new Float32Array(galaxyParameters.count * 3);

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
            
            randomness[i3] = randomX;
            randomness[i3+1] = randomY;
            randomness[i3+2] = randomZ;

            positions[i3] = Math.cos(branchAngle + spinAngle) * radius;
            positions[i3 + 1] = 0;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius;
            
            const mixedColor = colorInside.clone();
            mixedColor.lerp(colorOutside, radius / galaxyParameters.radius);

            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3));


        material = new THREE.PointsMaterial({
            size: galaxyParameters.size,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });

        points = new THREE.Points(geometry, material);
        galaxyGroup.add(points);
        
        galaxyGroup.rotation.x = Math.PI * 0.2;
        galaxyGroup.position.y = 5;
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
      
        if(galaxyGroup && geometry) {
            const positions = geometry.attributes.position as THREE.BufferAttribute;
            const randomness = geometry.attributes.aRandomness as THREE.BufferAttribute;

            // Orbital camera movement
            const cameraAngle = elapsedTime * 0.05;
            camera.position.x = Math.sin(cameraAngle) * 30;
            camera.position.z = Math.cos(cameraAngle) * 30;
            
            // Mouse parallax effect
            const parallaxX = mouse.current.x * 3;
            const parallaxY = -mouse.current.y * 3;
            camera.position.x += parallaxX;
            camera.position.y += parallaxY;
            
            // Particle randomness
            for (let i = 0; i < galaxyParameters.count; i++) {
                const i3 = i * 3;
                const x = positions.getX(i);
                const y = positions.getY(i);
                const z = positions.getZ(i);
                
                const randomX = randomness.getX(i);
                const randomY = randomness.getY(i);
                const randomZ = randomness.getZ(i);

                positions.setX(i, x + (Math.sin(elapsedTime * 0.1 + i) * randomX * 0.001));
                positions.setY(i, y + (Math.cos(elapsedTime * 0.1 + i) * randomY * 0.001));
                positions.setZ(i, z + (Math.sin(elapsedTime * 0.1 + i) * randomZ * 0.001));
            }
            positions.needsUpdate = true;
        }
      
        camera.lookAt(galaxyGroup.position);
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
    router.push('/home');
  };
  
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 z-0"></canvas>
      
      <div className={cn(
        "absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-1000",
        isContentVisible ? 'opacity-100' : 'opacity-0'
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
        isContentVisible ? "opacity-100" : "opacity-0"
      )}>
         <p>Developed by Haxis</p>
      </div>

    </div>
  );
}
