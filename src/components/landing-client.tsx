
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
        "absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out",
        isContentVisible ? 'opacity-100' : 'opacity-0',
        isNavigating ? 'opacity-0' : 'opacity-100'
      )}>

        <div className="absolute top-8 left-8 text-white" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.4)'}}>
          <p className="text-2xl">Welcome To</p>
          <p className="text-4xl font-bold tracking-widest">FORWARD INFINITY</p>
           <h1 
            className="text-2xl font-sans font-bold text-white/90 mt-2"
          >
            欢迎来到 前行无界
          </h1>
        </div>
        
      </div>

      <div className={cn(
        "absolute bottom-8 w-full text-center text-xs text-white/40 transition-opacity duration-1000 ease-in-out",
        isContentVisible ? "opacity-100" : "opacity-0",
        isNavigating ? 'opacity-0' : 'opacity-100'
      )}>
         <p>Developed by Haxis and Mark</p>
      </div>

    </div>
  );
}
