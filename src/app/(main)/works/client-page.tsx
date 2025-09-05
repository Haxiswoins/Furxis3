

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppWindow, UserSquare } from 'lucide-react';
import type { Work } from '@/types';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
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

type ViewMode = 'card' | 'avatar';

type WorksPageClientProps = {
  worksByYear: Record<string, Work[]>;
  sortedYears: string[];
}

function CardView({ works }: { works: Work[] }) {
  return (
    <motion.div 
      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {works.map((work) => (
        <motion.div key={work.id} variants={itemVariants}>
          <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col text-sm h-full group hover:-translate-y-1">
            <Link href={`/works/${work.id}`} passHref>
              <CardHeader className="p-0">
                <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={work.imageUrls[0]}
                      alt={work.workName}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      style={{objectFit: 'cover'}}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
              </CardHeader>
            </Link>
            <CardContent className="p-3 flex-grow">
              <CardTitle className="text-base font-headline mb-1 truncate">{work.workName}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                委托人: {work.clientName}
                {work.makerName && ` | 装师: ${work.makerName}`}
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

function AvatarView({ works }: { works: Work[] }) {
    return (
        <motion.div 
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {works.map((work) => (
                <motion.div key={work.id} variants={itemVariants}>
                    <Link href={`/works/${work.id}`} className="group flex flex-col items-center gap-2 text-center">
                        <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2 border-transparent group-hover:border-primary transition-all duration-300">
                           <AvatarImage src={work.avatarUrl || work.imageUrls[0]} alt={work.workName} />
                           <AvatarFallback>{work.workName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="text-xs md:text-sm font-medium transition-colors duration-300 group-hover:text-primary truncate w-full">{work.workName}</p>
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    );
}

export function WorksPageClient({ worksByYear, sortedYears }: WorksPageClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  return (
    <div>
      <div className="flex justify-between items-center mb-12">
        <div className="text-center flex-grow">
            <h1 className="text-4xl font-headline">作品一览</h1>
            <p className="mt-2 text-lg text-muted-foreground">
            这里是我们过往的精彩作品集锦。
            </p>
        </div>
        <div className="flex-shrink-0">
             <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === 'card' ? 'avatar' : 'card')}>
                {viewMode === 'card' ? <UserSquare /> : <AppWindow />}
            </Button>
        </div>
      </div>

      <div className="space-y-12">
        {sortedYears.length > 0 ? (
          sortedYears.map(year => (
            <div key={year}>
              <h2 className="text-3xl font-headline mb-6 pl-4 border-l-4 border-primary">{year}</h2>
              {viewMode === 'card' ? <CardView works={worksByYear[year]} /> : <AvatarView works={worksByYear[year]} />}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">暂无作品展示。</p>
          </div>
        )}
      </div>
    </div>
  );
}
