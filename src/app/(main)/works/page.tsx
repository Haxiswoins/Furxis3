
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getWorks } from '@/lib/data-service';
import type { Work } from '@/types';
import { motion } from 'framer-motion';

function WorkCardSkeleton() {
  return (
    <Card className="overflow-hidden shadow-lg flex flex-col text-sm">
      <CardHeader className="p-0">
        <div className="relative aspect-[3/4] bg-muted">
          <Skeleton className="h-full w-full" />
        </div>
      </CardHeader>
      <CardContent className="p-3 flex-grow">
        <Skeleton className="h-6 w-3/4 mb-1" />
        <Skeleton className="h-4 w-1/2 mb-2" />
      </CardContent>
    </Card>
  );
}

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

      {loading ? (
        <div className="space-y-12">
            {[...Array(2)].map((_, i) => (
                <div key={i}>
                    <Skeleton className="h-10 w-32 mb-6" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, j) => <WorkCardSkeleton key={j} />)}
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="space-y-12">
          {sortedYears.map(year => (
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
          ))}
        </div>
      )}
    </motion.div>
  );
}
