
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { CharacterSeries, SiteContent } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
};

type AdoptionSeriesClientPageProps = {
  seriesData: CharacterSeries[];
  content: SiteContent | null;
}

export function AdoptionSeriesClientPage({ seriesData, content }: AdoptionSeriesClientPageProps) {

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline">设定领养</h1>
        <p className="mt-2 text-lg text-muted-foreground">
        {content?.adoptionPageDescription || '给这些预先设计的角色一个家。'}
        </p>
      </div>

      {seriesData.length > 0 ? (
        <motion.div 
            className="flex flex-col gap-8 md:gap-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {seriesData.map((s) => (
                <motion.div 
                    key={s.id} 
                    variants={itemVariants}
                >
                    <Link href={`/adoption/${encodeURIComponent(s.name)}`} className="group block relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 aspect-[16/9] md:aspect-[16/7]">
                        <Image
                            src={s.imageUrl}
                            alt={s.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 80vw"
                            style={{objectFit: 'cover'}}
                            className="transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex flex-col justify-center items-center p-8 text-white bg-black/40 hover:bg-black/50 transition-colors duration-300">
                           <div className="text-center max-w-2xl">
                                <h3 className="font-headline text-3xl md:text-5xl" style={{textShadow: '2px 2px 6px rgba(0,0,0,0.8)'}}>{s.name}</h3>
                                <p className="text-sm md:text-base opacity-90 mt-2 line-clamp-2" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>{s.description}</p>
                                <div className="mt-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-white/50 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-white/20 group-hover:border-white transition-all duration-300">
                                        进入系列 <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </motion.div>
      ) : (
        <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">暂无设定系列。</p>
        </div>
      )}
    </motion.div>
  );
}
