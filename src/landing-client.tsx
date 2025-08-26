
'use client';

import { useRouter } from 'next/navigation';

export function LandingPageClient() {
  const router = useRouter();
  
  const handleNavigate = () => {
    router.push('/home');
  };
  
  return (
    <div 
        className="relative h-screen w-full overflow-hidden cursor-pointer flex items-center justify-center"
        onClick={handleNavigate}
    >
      <div className="text-white text-center">
          <div style={{textShadow: '1px 1px 4px rgba(0, 0, 0, 0.5)'}}>
              <p className="text-2xl font-light tracking-wider">Welcome to</p>
              <h1 className="text-5xl font-bold tracking-widest mt-1">FORWARD INFINITY</h1>
              <h1 className="text-4xl font-bold mt-4">欢迎来到 前行无界</h1>
          </div>

           <div className="mt-10 max-w-xs text-sm mx-auto" style={{textShadow: '1px 1px 4px rgba(0, 0, 0, 0.5)'}}>
              <p>前行无界工作室于2024年成立，我们致力于为您提供充满创意的角色设计服务与定制化Fursuit产品。</p>
              <p className="font-serif-sc mt-4">Established in 2024, FORWARD INFINITY studio is dedicated to providing you with creative character design services and Fursuits.</p>
          </div>
          
          <p className="mt-12 text-sm text-white/90 animate-pulse">点击任意位置进入网站</p>
      </div>
    </div>
  );
}
