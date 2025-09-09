'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ContactInfo } from '@/components/contact-info';
import type { SiteContent } from '@/types';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

type HomeClientProps = {
  content: SiteContent | null;
}

export function HomeClient({ content }: HomeClientProps) {
  const router = useRouter();
  const [isWarping, setIsWarping] = useState(false);

  const handleNavigate = (path: string) => {
    setIsWarping(true);
    setTimeout(() => {
        router.push(path);
    }, 600);
  };
  
  const gradientStyle: React.CSSProperties = {
    background: 'linear-gradient(to top, hsla(var(--card)) 8%, hsla(var(--card), 0.7) 30%, transparent 50%)'
  };


  return (
    <>
      <div className="container mx-auto">
        <motion.div 
            className="relative z-10 flex flex-col min-h-screen"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="w-full py-8 md:py-12 pt-24">
            <motion.div className="text-center mb-10 md:mb-16 px-4" variants={itemVariants}>
                <a onClick={() => handleNavigate('/')} className="cursor-pointer">
                    <div className="relative inline-block group px-4">
                        <h1 className="text-4xl sm:text-5xl font-headline transition-colors duration-300 relative z-10 group-hover:text-primary">
                        前行无界
                        </h1>
                        <div
                        className="absolute inset-0 flex items-center justify-center text-primary opacity-80"
                        style={{ zIndex: 5 }}
                        >
                        <span className="font-body text-xl sm:text-4xl font-extralight tracking-[0.3em] whitespace-nowrap px-4 mt-10 sm:mt-12">
                            FORWARD INFINITY
                        </span>
                        </div>
                    </div>
                </a>
            </motion.div>
            
            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4"
                variants={containerVariants}
            >
                <motion.div variants={itemVariants}>
                    <a onClick={() => handleNavigate('/commission')} className="group block cursor-pointer">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ease-in-out hover:shadow-primary/30 aspect-[4/5]">
                            <Image
                                src={content?.commissionImageUrl || "https://placehold.co/800x1000.png"}
                                alt="委托申请"
                                fill
                                priority
                                sizes="(max-width: 768px) 80vw, 33vw"
                                style={{objectFit: "cover"}}
                                className="transition-transform duration-500 ease-in-out group-hover:scale-105"
                                data-ai-hint="commission custom"
                            />
                            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white transition-all duration-500 ease-in-out" style={gradientStyle}>
                                <h2 className="font-headline text-2xl md:text-3xl transition-transform duration-500 ease-in-out group-hover:-translate-y-1">{content?.commissionTitle || '委托申请'}</h2>
                                <p className="mt-1 opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-90 group-hover:-translate-y-1 text-sm md:text-base">{content?.commissionDescription || '为您量身定制。'}</p>
                            </div>
                        </div>
                    </a>
                </motion.div>

                <motion.div variants={itemVariants}>
                     <a onClick={() => handleNavigate('/adoption')} className="group block cursor-pointer">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ease-in-out hover:shadow-primary/30 aspect-[4/5]">
                            <Image
                                src={content?.adoptionImageUrl || "https://placehold.co/800x1000.png"}
                                alt="设定领养"
                                fill
                                sizes="(max-width: 768px) 80vw, 33vw"
                                style={{objectFit: "cover"}}
                                className="transition-transform duration-500 ease-in-out group-hover:scale-105"
                                data-ai-hint="character design"
                            />
                             <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white transition-all duration-500 ease-in-out" style={gradientStyle}>
                                <h2 className="font-headline text-2xl md:text-3xl transition-transform duration-500 ease-in-out group-hover:-translate-y-1">{content?.adoptionTitle || '设定领养'}</h2>
                                <p className="mt-1 opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-90 group-hover:-translate-y-1 text-sm md:text-base">{content?.adoptionDescription || '领养一个预先设计的角色。'}</p>
                            </div>
                        </div>
                    </a>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                     <a onClick={() => handleNavigate('/works')} className="group block cursor-pointer">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ease-in-out hover:shadow-primary/30 aspect-[4/5]">
                            <Image
                                src={content?.workImageUrl || "https://placehold.co/800x1000.png"}
                                alt="作品一览"
                                fill
                                sizes="(max-width: 768px) 80vw, 33vw"
                                style={{objectFit: "cover"}}
                                className="transition-transform duration-500 ease-in-out group-hover:scale-105"
                                data-ai-hint="portfolio gallery"
                            />
                             <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white transition-all duration-500 ease-in-out" style={gradientStyle}>
                                <h2 className="font-headline text-2xl md:text-3xl transition-transform duration-500 ease-in-out group-hover:-translate-y-1">{content?.workTitle || '作品一览'}</h2>
                                <p className="mt-1 opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-90 group-hover:-translate-y-1 text-sm md:text-base">{content?.workDescription || '查看我们过往的精彩作品。'}</p>
                            </div>
                        </div>
                    </a>
                </motion.div>
            </motion.div>
            </div>
            <motion.div className="w-full py-8 text-center mt-auto" variants={itemVariants}>
                <ContactInfo content={content} />
            </motion.div>
        </motion.div>
      </div>
      {/* Transition Mask */}
      <motion.div 
        className="fixed inset-0 z-[100] bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: isWarping ? 1 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut'}}
        style={{ pointerEvents: 'none' }}
      >
      </motion.div>
    </>
  );
}
