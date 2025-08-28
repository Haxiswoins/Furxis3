
import { AmbientLightBackground } from '@/components/ambient-light-background';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';
import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <div id="box" className="absolute inset-0 z-0 opacity-50" />
      <AmbientLightBackground />

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white">
        <h1 className="text-5xl md:text-7xl font-headline tracking-widest text-white/90" style={{ textShadow: "0 0 15px rgba(255,255,255,0.5)" }}>
            The Stars Arrives
        </h1>
        <p className="mt-4 text-lg text-white/70">
            欢迎来到前行无界工作室
        </p>
        <Link href="/home" passHref className="mt-12">
            <Button
              aria-label="进入网站"
              className="group relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/50 bg-black/30 text-white transition-all duration-300 ease-in-out hover:scale-110 hover:border-primary hover:shadow-[0_0_35px_rgba(255,97,47,0.7)] active:scale-100 backdrop-blur-sm"
            >
              <div className="absolute inset-0 rounded-full border-2 border-white/20 scale-125 group-hover:scale-150 group-hover:opacity-0 transition-all duration-500 animate-pulse"></div>
              <Rocket 
                  className="h-10 w-10 text-primary/80 transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1 group-hover:scale-110"
              />
            </Button>
        </Link>
      </div>
       <div className="absolute bottom-8 w-full text-center text-xs text-white/40">
         <p>Developed by Haxis and Mark</p>
      </div>
    </div>
  );
}
