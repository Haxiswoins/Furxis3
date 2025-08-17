'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getWorks } from '@/lib/data-service';
import type { Work } from '@/types';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

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
      ease: 'easeOut',
    },
  },
};

function WorksPageSkeleton() {
  return (
    <div>
      <div className="text-center mb-12">
        <Skeleton className="h-10 w-40 mx-auto" />
        <Skeleton className="h-6 w-80 mx-auto mt-4" />
      </div>
      <div className="space-y-12">
        <div>
          <Skeleton className="h-9 w-32 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg border">
                <Skeleton className="w-full aspect-[3/4]" />
                <div className="p-3">
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WorksPage() {
  const [worksByYear, setWorksByYear] = useState<Record<string, Work[]>>({});
  const [sortedYears, setSortedYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getWorks().then(worksData => {
      const groupedWorks = worksData.reduce((acc, work) => {
        const year = new Date(work.completionDate).getFullYear().toString();
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push(work);
        return acc;
      }, {} as Record<string, Work[]>);
      
      setWorksByYear(groupedWorks);
      setSortedYears(Object.keys(groupedWorks).sort((a, b) => parseInt(b) - parseInt(a)));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <WorksPageSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline">作品一览</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          这里是我们过往的精彩作品集锦。
        </p>
      </div>

      <div className="space-y-12">
        {sortedYears.length > 0 ? (
          sortedYears.map(year => (
            <div key={year}>
              <h2 className="text-3xl font-headline mb-6 pl-4 border-l-4 border-primary">{year}</h2>
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {worksByYear[year].map((work) => (
                  <motion.div key={work.id} variants={itemVariants}>
                    <Link href={`/works/${work.id}`} passHref>
                      <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col text-sm h-full group hover:-translate-y-1">
                        <CardHeader className="p-0">
                          <div className="relative aspect-[3/4] overflow-hidden">
                              <Image
                                src={work.imageUrls[0]}
                                alt={work.workName}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                style={{objectFit: 'cover'}}
                                className="transition-transform duration-300 group-hover:scale-105"
                              />
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 flex-grow">
                          <CardTitle className="text-base font-headline mb-1 truncate">{work.workName}</CardTitle>
                          <CardDescription className="text-xs text-muted-foreground">{work.clientName}</CardDescription>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">暂无作品展示。</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
