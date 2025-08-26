
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function LandingPageClient() {
  const router = useRouter();
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  
  useEffect(() => {
    router.prefetch('/home');

    const contentTimer = setTimeout(() => {
      setIsContentVisible(true);
    }, 500);

    return () => {
      clearTimeout(contentTimer);
    };
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
      <div className={cn(
        "absolute inset-0 z-20 flex flex-col items-start justify-start p-8 md:p-12 transition-opacity duration-500 ease-in-out",
        isContentVisible ? 'opacity-100' : 'opacity-0',
        isNavigating ? 'opacity-0' : 'opacity-100'
      )}>

        <div className="text-white" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.4)'}}>
          <p className="text-xl md:text-2xl">Welcome to</p>
          <div className="mt-2">
            <p className="text-4xl md:text-5xl font-bold tracking-widest">FORWARD INFINITY</p>
            <h1 
              className="text-3xl md:text-4xl font-sans font-bold text-white mt-2"
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

        <p 
          className="absolute bottom-12 left-8 md:left-12 text-sm text-white/70 animate-pulse"
        >
          点击任意位置进入网站
        </p>
        
      </div>

    </div>
  );
}
