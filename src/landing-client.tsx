
'use client';

import { useRouter } from 'next/navigation';

export function LandingPageClient() {
  const router = useRouter();
  
  const handleNavigate = () => {
    router.push('/home');
  };
  
  return (
    <div 
        className="relative h-screen w-full overflow-hidden cursor-pointer"
        onClick={handleNavigate}
    >
      <div 
        className="absolute inset-0 z-20 flex items-center justify-center"
      >
        <div className="absolute top-8 left-8 text-white">
            <div className="mt-2" style={{textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7)'}}>
                <h1 className="text-5xl font-bold tracking-widest">FORWARD INFINITY</h1>
                <h1 className="text-4xl font-bold mt-2">欢迎来到 前行无界</h1>
            </div>

             <div className="mt-10 max-w-xs text-sm" style={{textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7)'}}>
                <p>前行无界工作室于2024年成立，我们致力于为您提供充满创意的角色设计服务与定制化Fursuit产品。</p>
                <p className="font-serif-sc mt-4">Established in 2024, FORWARD INFINITY studio is dedicated to providing you with creative character design services and Fursuits.</p>
            </div>
            
            <p className="mt-12 text-sm text-white/90">点击任意位置进入网站</p>
        </div>
      </div>
    </div>
  );
}
