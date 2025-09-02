
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import type { CommissionOption } from '@/types';
import { motion } from 'framer-motion';

const lightStatusStyles: { [key: string]: string } = {
  '开放中': 'bg-primary/10 text-primary border-primary/20',
  '已结束': 'bg-muted text-muted-foreground border-border',
  '即将开放': 'bg-accent text-accent-foreground border-accent-foreground/20',
};

const darkStatusStyles: { [key: string]: string } = {
  '开放中': 'bg-primary/20 text-primary border-primary/30',
  '已结束': 'bg-muted/80 text-muted-foreground border-border',
  '即将开放': 'bg-accent/80 text-accent-foreground border-accent-foreground/30',
};


type CommissionClientPageProps = {
  commissionOptions: CommissionOption[];
};

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

export function CommissionClientPage({ commissionOptions }: CommissionClientPageProps) {
  const { theme } = useTheme();
  const statusStyles = theme === 'dark' ? darkStatusStyles : lightStatusStyles;

  return (
    <motion.div 
      className="flex flex-col gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {commissionOptions.length > 0 ? (
        commissionOptions.map((item) => (
          <motion.div key={item.id} variants={itemVariants}>
            <Link href={`/commission/${encodeURIComponent(item.name)}`} className="group block relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-[16/9] md:aspect-[16/4] relative">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 90vw, (max-width: 1024px) 70vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 group-hover:scale-105"
                />
                 <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-12 text-white bg-gradient-to-r from-black/70 to-50%">
                  <div className="max-w-md">
                    <h3 className="font-headline text-2xl md:text-4xl font-bold" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>{item.name}</h3>
                    <p className="text-sm md:text-base opacity-90 mt-1" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>{item.category}</p>
                    <p className="text-xs opacity-80 mt-4 line-clamp-3" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>{item.description}</p>
                  </div>
                </div>
                 <Badge variant="outline" className={cn("absolute top-4 right-4 text-xs font-semibold backdrop-blur-sm", statusStyles[item.status])}>
                  {item.status}
                </Badge>
              </div>
            </Link>
          </motion.div>
        ))
      ) : (
        <div className="col-span-full text-center py-10">
          <p className="text-muted-foreground">该年份下暂无委托选项。</p>
        </div>
      )}
    </motion.div>
  );
}
