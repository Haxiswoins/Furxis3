
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { CharacterSeries, SiteContent } from '@/types';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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
      ease: 'easeInOut',
    },
  },
};

type AdoptionSeriesClientPageProps = {
  seriesData: CharacterSeries[];
  content: SiteContent | null;
}

export function AdoptionSeriesClientPage({ seriesData, content }: AdoptionSeriesClientPageProps) {

  const getGridSpanClass = (index: number) => {
    // A repeating pattern for visual variety. You can adjust this pattern.
    const pattern = index % 6;
    switch (pattern) {
      case 0:
        return "md:col-span-2 md:row-span-2"; // Large focus item
      case 1:
        return "md:row-span-1"; // Standard
      case 2:
        return "md:row-span-1"; // Standard
      case 3:
        return "md:col-span-1 md:row-span-2"; // Tall item
      case 4:
         return "md:col-span-2 md:row-span-1"; // Wide item
      case 5:
        return "md:row-span-1"; // Standard
      default:
        return "md:row-span-1";
    }
  };

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
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 grid-flow-dense gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {seriesData.map((s, index) => (
                <motion.div 
                    key={s.id} 
                    variants={itemVariants}
                    className={cn(
                      "group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1",
                      getGridSpanClass(index)
                    )}
                >
                    <Link href={`/adoption/${encodeURIComponent(s.name)}`} className="block w-full h-full">
                        <Image
                            src={s.imageUrl}
                            alt={s.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{objectFit: 'cover'}}
                            className="transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white bg-gradient-to-t from-black/70 to-transparent">
                            <h3 className="font-headline text-2xl" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.8)'}}>{s.name}</h3>
                            <p className="text-sm opacity-0 group-hover:opacity-90 transition-opacity duration-300 mt-1 line-clamp-2" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>{s.description}</p>
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
