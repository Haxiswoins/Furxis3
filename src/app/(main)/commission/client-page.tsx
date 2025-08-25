
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import type { CommissionOption } from '@/types';
import { motion } from 'framer-motion';

const lightStatusStyles: { [key: string]: string } = {
  '开放中': 'bg-green-100 text-green-800 border-green-200',
  '已结束': 'bg-zinc-100 text-zinc-800 border-zinc-200',
  '即将开放': 'bg-blue-100 text-blue-800 border-blue-200',
};

const darkStatusStyles: { [key: string]: string } = {
  '开放中': 'bg-green-500/20 text-green-300 border-green-500/30',
  '已结束': 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
  '即将开放': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {commissionOptions.length > 0 ? (
        commissionOptions.map((item) => (
          <motion.div key={item.id} variants={itemVariants}>
            <Link href={`/commission/${encodeURIComponent(item.name)}`} className="group block relative aspect-[3/5] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                className="transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-white bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <div className="text-center space-y-2">
                  <h3 className="font-headline text-2xl font-bold" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>{item.name}</h3>
                  <p className="text-sm opacity-90" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>{item.category}</p>
                  <p className="text-xs opacity-80 mt-2 line-clamp-2" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>{item.description}</p>
                </div>
                <div className="absolute bottom-6 flex flex-col items-center gap-3">
                  <Badge variant="outline" className={cn("text-xs font-semibold backdrop-blur-sm", statusStyles[item.status])}>
                    {item.status}
                  </Badge>
                </div>
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
