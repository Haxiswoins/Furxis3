
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { CharacterSeries, SiteContent } from '@/types';

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
        <h1 className="text-3xl md:text-4xl font-headline">设定领养</h1>
        <p className="mt-2 text-base md:text-lg text-muted-foreground">
        {content?.adoptionPageDescription || '给这些预先设计的角色一个家。'}
        </p>
      </div>

      {seriesData.length > 0 ? (
        <motion.div 
            className="space-y-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {seriesData.map((s) => (
                <motion.div 
                    key={s.id} 
                    variants={itemVariants}
                >
                    <h2 className="text-2xl md:text-3xl font-headline mb-4 pl-4 border-l-4 border-primary">{s.name}</h2>
                    <Link href={`/adoption/${encodeURIComponent(s.name)}`} className="group block relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 aspect-[16/9] md:aspect-[16/7]">
                        <Image
                            src={s.imageUrl}
                            alt={s.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 80vw"
                            style={{objectFit: 'cover'}}
                            className="transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent transition-colors duration-300">
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
