
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function LandingPageClient() {
  const router = useRouter();
  
  useEffect(() => {
    router.prefetch('/home');
  }, [router]);


  const handleNavigate = () => {
    router.push('/home');
  };
  
  return (
    <div 
      className="relative h-screen w-full overflow-hidden bg-transparent cursor-pointer"
      onClick={handleNavigate}
      aria-label="进入网站"
      role="button"
      tabIndex={0}
    >
      <div 
        className="absolute inset-0 z-20 flex flex-col items-start justify-start p-8 md:p-12"
      >
        <div className="text-white">
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
      </div>
      
       <p 
          className="absolute bottom-12 left-8 md:left-12 text-sm text-white/70 animate-pulse"
        >
          点击任意位置进入网站
        </p>

    </div>
  );
}
