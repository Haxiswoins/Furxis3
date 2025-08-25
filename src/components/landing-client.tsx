
'use client';
import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';

function Starfield(props: any) {
  const ref = useRef<any>();
  const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }));

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#ffa0e0"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

function EnterButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-4 text-white hover:text-primary transition-colors duration-300"
    >
      <div className="relative">
        <Rocket className="h-16 w-16 transition-transform duration-500 ease-in-out group-hover:-translate-y-2 group-hover:scale-110" />
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary/50 rounded-full blur-sm transition-all duration-500 ease-in-out group-hover:w-16 group-hover:bg-primary" />
      </div>
      <span className="font-headline text-2xl tracking-widest transition-all duration-300 group-hover:text-primary group-hover:tracking-[0.2em]">
        进入
      </span>
    </button>
  );
}

export function LandingPageClient() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleEnter = () => {
    setIsNavigating(true);
    setTimeout(() => {
      router.push('/home');
    }, 1500); // Match this with warp animation duration
  };

  return (
    <div className={`w-screen h-screen bg-black transition-opacity duration-1000 ${isNavigating ? 'opacity-0' : 'opacity-100'}`}>
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Suspense fallback={null}>
          <Starfield />
        </Suspense>
      </Canvas>
      {!isNavigating && <EnterButton onClick={handleEnter} />}
      {isNavigating && <WarpEffect />}
    </div>
  );
}

function WarpEffect() {
  const { size } = useThree();
  const lineCount = 100;
  
  return (
    <div className="absolute inset-0 z-20 overflow-hidden">
      {Array.from({ length: lineCount }).map((_, i) => (
        <div
          key={i}
          className="absolute h-1 bg-white/50 animate-warp"
          style={{
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 30 + 30}%`,
            animationDuration: `${Math.random() * 0.5 + 0.5}s`,
            animationDelay: `${Math.random() * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

