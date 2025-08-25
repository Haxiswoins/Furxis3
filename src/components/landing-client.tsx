
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
    // Prefetch the home page as soon as the landing page is interactive
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
    
    // The delay here should be slightly shorter than the CSS transition duration
    // to ensure the navigation starts before the fade-out completes.
    setTimeout(() => {
        router.push('/home');
    }, 400); 
  };
  
  return (
    // Ensure the main container is transparent to let the AppShell background show through.
    <div className="relative h-screen w-full overflow-hidden bg-transparent">
      
      <div className={cn(
        "absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out",
        isContentVisible ? 'opacity-100' : 'opacity-0',
        isNavigating ? 'opacity-0' : 'opacity-100' // Fade out when navigating
      )}>
        <div className="flex flex-col items-center text-center text-white" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.4)'}}>
            <h1 className="font-headline text-4xl md:text-5xl leading-tight">欢迎来到 前行无界</h1>
            <p className="mt-1 font-body text-2xl md:text-3xl font-light tracking-widest text-white/90">工作室官方网站</p>
            <p className="mt-8 max-w-lg text-base md:text-lg text-white/80">
                前行无界工作室于2024年成立，我们致力于为您提供充满创意的角色设计服务与定制化Fursuit产品
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
        isNavigating ? 'opacity-0' : 'opacity-100' // Also fade out this text
      )}>
         <p>Developed by Haxis and Mark</p>
      </div>

    </div>
  );
}
