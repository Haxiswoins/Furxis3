
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const galaxyParameters = {
    count: 50000,
    size: 0.015,
    radius: 20,
    branches: 5,
    spin: 1.5,
    randomness: 0.5,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984'
};


export function LandingPageClient() {
  const router = useRouter();
  const [isWarping, setIsWarping] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    router.prefetch('/home');

    if (!canvasRef.current) return;
    
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    let geometry: THREE.BufferGeometry | null = null;
    let material: THREE.PointsMaterial | null = null;
    let galaxyGroup: THREE.Group | null = null;
    
    const generateGalaxy = () => {
        if (galaxyGroup) {
            geometry?.dispose();
            material?.dispose();
            scene.remove(galaxyGroup);
        }

        galaxyGroup = new THREE.Group();
        scene.add(galaxyGroup);
        
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
    let animationFrameId: number;

    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        if (isWarping) {
            camera.position.z -= 0.5;
        }

        if(galaxyGroup) {
            (galaxyGroup.children[0] as THREE.Points).rotation.y = elapsedTime * 0.1;
        }
            
        const parallaxX = mouse.current.x * 0.2;
        const parallaxY = -mouse.current.y * 0.2;
            
        camera.position.x += (parallaxX - camera.position.x) * 0.02;
        camera.position.y += (parallaxY - camera.position.y) * 0.02;

        renderer.render(scene, camera);
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
  }, [isWarping, router]);


  const handleNavigate = () => {
    setIsWarping(true);
    setTimeout(() => {
        router.push('/home');
    }, 800); 
  };
  
  return (
    <div 
        className="relative h-screen w-full overflow-hidden bg-black cursor-pointer"
        onClick={handleNavigate}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0"></canvas>
      
      <motion.div 
        className={cn(
            "absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-500"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isWarping ? 0 : 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="absolute top-8 left-8 text-white">
            <p className="text-xl font-light" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.5)'}}>Welcome to</p>
            <div className="-mt-1 mt-2">
                <h1 className="text-5xl font-bold tracking-widest" style={{textShadow: '2px 2px 5px rgba(0,0,0,0.5)'}}>FORWARD INFINITY</h1>
                <h1 className="text-4xl font-bold mt-2" style={{textShadow: '2px 2px 5px rgba(0,0,0,0.5)'}}>欢迎来到 前行无界</h1>
            </div>

             <div className="mt-10 max-w-xs text-sm text-white">
                <p style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>前行无界工作室于2024年成立，我们致力于为您提供充满创意的角色设计服务与定制化Fursuit产品。</p>
                <p className="font-serif-sc mt-4" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>Established in 2024, FORWARD INFINITY studio is dedicated to providing you with creative character design services and Fursuits.</p>
            </div>
            
            <p className="mt-12 text-sm text-white/90">点击任意位置进入网站</p>
        </div>
      </motion.div>
    </div>
  );
}
