
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getCharacterSeries, getSiteContent } from '@/lib/data-service';
import type { CharacterSeries, SiteContent } from '@/types';
import { motion } from 'framer-motion';

function SeriesCardSkeleton() {
  return (
    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-muted">
       <Skeleton className="w-full h-full" />
       <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/50 to-transparent">
           <Skeleton className="h-7 w-3/4" />
           <Skeleton className="h-4 w-1/2 mt-2" />
       </div>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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


export default function AdoptionSeriesPage() {
  const [seriesData, setSeriesData] = useState<CharacterSeries[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getCharacterSeries(),
      getSiteContent(),
    ]).then(([series, siteContent]) => {
      setSeriesData(series);
      setContent(siteContent);
      setLoading(false);
    });
  }, []);


  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline">设定领养</h1>
        {loading ? (
            <Skeleton className="h-6 w-80 mx-auto mt-4" />
        ) : (
            <p className="mt-2 text-lg text-muted-foreground">
            {content?.adoptionPageDescription || '给这些预先设计的角色一个家。'}
            </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <SeriesCardSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {seriesData.length > 0 ? (
            seriesData.map((s) => (
                <motion.div key={s.id} variants={itemVariants}>
                    <Link href={`/adoption/${encodeURIComponent(s.name)}`} className="group">
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <Image
                        src={s.imageUrl}
                        alt={s.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        style={{objectFit: 'cover'}}
                        className="transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white bg-gradient-to-t from-black/60 to-transparent">
                        <h3 className="font-headline text-2xl" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.8)'}}>{s.name}</h3>
                        <p className="text-sm opacity-90 mt-1 line-clamp-2" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>{s.description}</p>
                        </div>
                    </div>
                    </Link>
                </motion.div>
            ))
            ) : (
            <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">暂无设定系列。</p>
            </div>
            )}
        </motion.div>
      )}
    </div>
  );
}
