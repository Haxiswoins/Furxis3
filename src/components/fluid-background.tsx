
'use client';

import { useRef, useEffect } from 'react';
import { noise } from '@/lib/perlin';

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDarkTheme = () => document.documentElement.classList.contains('dark');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let time = 0;
    noise.seed(Math.random());

    const particleSystem = {
      particles: [] as any[],
      particleCount: 50,
      particleSize: 1,
      maxSpeed: 0.5,
      init: function () {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
          this.particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: 0,
            vy: 0,
          });
        }
      },
      update: function (primaryHsl: number[], accentHsl: number[]) {
        ctx.clearRect(0, 0, width, height);

        this.particles.forEach((p, i) => {
          const angle = noise.perlin3(p.x / 400, p.y / 400, time) * Math.PI * 2;
          p.vx += Math.cos(angle) * 0.1;
          p.vy += Math.sin(angle) * 0.1;
          
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (speed > this.maxSpeed) {
              p.vx = (p.vx / speed) * this.maxSpeed;
              p.vy = (p.vy / speed) * this.maxSpeed;
          }

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          const distanceToCenter = Math.sqrt(Math.pow(p.x - width / 2, 2) + Math.pow(p.y - height / 2, 2));
          const colorRatio = Math.min(distanceToCenter / (Math.max(width, height) / 2), 1);
          
          const h = primaryHsl[0] + (accentHsl[0] - primaryHsl[0]) * colorRatio;
          const s = primaryHsl[1] + (accentHsl[1] - primaryHsl[1]) * colorRatio;
          const l = primaryHsl[2] + (accentHsl[2] - primaryHsl[2]) * colorRatio;

          ctx.beginPath();
          ctx.arc(p.x, p.y, this.particleSize, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, 0.5)`;
          ctx.fill();
        });
      },
    };
    
    particleSystem.init();

    let animationFrameId: number;
    
    const getHslFromCssVar = (varName: string) => {
      const hslString = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      return hslString.split(' ').map(parseFloat);
    }
    
    const animate = () => {
      time += 0.002;
      
      const primary = getHslFromCssVar('--primary');
      const accent = getHslFromCssVar('--accent');

      particleSystem.update(primary, accent);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particleSystem.init();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full" />;
}
