
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';
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
    <div className="relative h-screen w-full overflow-hidden bg-transparent">
      
      <div className={cn(
        "absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out",
        isContentVisible ? 'opacity-100' : 'opacity-0',
        isNavigating ? 'opacity-0' : 'opacity-100'
      )}>

        <div 
          className="absolute left-1/2 -translate-x-1/2 top-1/4 text-center text-white"
          style={{textShadow: '1px 1px 4px rgba(0,0,0,0.5)'}}
        >
          <h1 className="text-5xl font-sans font-bold">
            欢迎来到 前行无界
          </h1>
          <p className="mt-4 text-xl font-sans tracking-widest text-white/80">
            兽装工作室
          </p>
        </div>


        <div className="absolute bottom-[20%]">
          <button
            onClick={handleNavigate}
            aria-label="进入网站"
            className="group relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/50 bg-black/30 text-white transition-all duration-300 ease-in-out hover:scale-110 hover:border-primary hover:shadow-[0_0_35px_rgba(255,97,47,0.7)] active:scale-100 backdrop-blur-sm"
          >
            <div className="absolute inset-0 rounded-full border-2 border-white/20 scale-125 group-hover:scale-150 group-hover:opacity-0 transition-all duration-500 animate-pulse"></div>
            <Rocket 
                className="h-10 w-10 text-primary/80 transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1 group-hover:scale-110"
                style={{ transform: 'rotate(-45deg)' }}
            />
          </button>
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
