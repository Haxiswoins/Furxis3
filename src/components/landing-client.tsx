
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function LandingPageClient() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  
  useEffect(() => {
    router.prefetch('/home');
  }, [router]);


  const handleNavigate = () => {
    setIsNavigating(true);
    
    setTimeout(() => {
        router.push('/home');
    }, 400); 
  };
  
  return (
    <div 
      className="relative h-screen w-full overflow-hidden bg-transparent cursor-pointer"
      onClick={handleNavigate}
      aria-label="进入网站"
      role="button"
      tabIndex={0}
    >
      <motion.div 
        className="absolute inset-0 z-20 flex flex-col items-start justify-start p-8 md:p-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isNavigating ? 0 : 1, y: isNavigating ? 20 : 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="text-white">
          <p className="text-xl md:text-2xl">Welcome to</p>
          <div className="mt-2">
            <p className="text-4xl md:text-5xl font-bold tracking-widest" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.4)'}}>FORWARD INFINITY</p>
            <h1 
              className="text-3xl md:text-4xl font-sans font-bold text-white mt-2"
               style={{textShadow: '1px 1px 3px rgba(0,0,0,0.4)'}}
            >
              欢迎来到 前行无界
            </h1>
          </div>

          <div className="mt-10 space-y-4 text-sm max-w-xs">
             <p>
                前行无界工作室于2024年成立，我们致力于为您提供充满创意的角色设计服务与定制化Fursuit产品
             </p>
             <p className="font-serif-sc">
                Established in 2024, FORWARD INFINITY studio is dedicated to providing you with creative character design services and Fursuits.
             </p>
          </div>
        </div>
      </motion.div>
      
       <motion.p 
          className="absolute bottom-12 left-8 md:left-12 text-sm text-white/70 animate-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: isNavigating ? 0 : 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          点击任意位置进入网站
        </motion.p>

    </div>
  );
}
