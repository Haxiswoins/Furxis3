
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LandingPageClient() {
  const router = useRouter();
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  
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
    setIsWarping(true);
    
    setTimeout(() => {
        router.push('/home');
    }, 800); 
  };
  
  return (
    <div className="relative h-screen w-full overflow-hidden bg-transparent">
      
      <div className={cn(
        "absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-500",
        isContentVisible ? 'opacity-100' : 'opacity-0',
        isWarping ? 'opacity-0' : 'opacity-100'
      )}>
        <div className="absolute bottom-[20%]">
          <button
            onClick={handleNavigate}
            aria-label="进入网站"
            className="group relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/50 bg-background/30 text-foreground transition-all duration-300 ease-in-out hover:scale-110 hover:border-primary hover:shadow-[0_0_35px_rgba(255,97,47,0.7)] active:scale-100 backdrop-blur-sm"
          >
            <div className="absolute inset-0 rounded-full border-2 border-foreground/20 scale-125 group-hover:scale-150 group-hover:opacity-0 transition-all duration-500 animate-pulse"></div>
            <Rocket 
                className="h-10 w-10 text-primary/80 transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1 group-hover:scale-110"
                style={{ transform: 'rotate(-45deg)' }}
            />
          </button>
        </div>
      </div>

      <div className={cn(
        "absolute bottom-8 w-full text-center text-xs text-foreground/40 transition-opacity duration-1000 ease-in-out",
        isContentVisible ? "opacity-100" : "opacity-0",
        isWarping ? 'opacity-0' : 'opacity-100'
      )}>
         <p>Developed by Haxis and Mark</p>
      </div>

    </div>
  );
}
