
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';


export function LandingPageClient() {
  const router = useRouter();
  const [isWarping, setIsWarping] = useState(false);
  
  useEffect(() => {
    router.prefetch('/home');
  }, [router]);


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
      <motion.div 
        className={cn(
            "absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-500"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isWarping ? 0 : 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="absolute top-8 left-8 text-white">
            <p className="text-xl font-light">Welcome to</p>
            <div className="mt-2">
                <h1 className="text-5xl font-bold tracking-widest">FORWARD INFINITY</h1>
                <h1 className="text-4xl font-bold mt-2">欢迎来到 前行无界</h1>
            </div>

             <div className="mt-10 max-w-xs text-sm text-white">
                <p>前行无界工作室于2024年成立，我们致力于为您提供充满创意的角色设计服务与定制化Fursuit产品。</p>
                <p className="font-serif-sc mt-4">Established in 2024, FORWARD INFINITY studio is dedicated to providing you with creative character design services and Fursuits.</p>
            </div>
            
            <p className="mt-12 text-sm text-white/90">点击任意位置进入网站</p>
        </div>
      </motion.div>
    </div>
  );
}
