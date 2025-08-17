
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import type { CommissionOption, CommissionStyle } from '@/types';
import { motion } from 'framer-motion';

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

type CommissionStyleClientPageProps = {
    styles: CommissionStyle[];
    commissionOption: CommissionOption;
    commissionName: string;
}

export function CommissionStyleClientPage({ styles, commissionOption, commissionName }: CommissionStyleClientPageProps) {
  const router = useRouter();
  const canApply = commissionOption?.status === '开放中' || commissionOption?.status === '即将开放';

  return (
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {styles.length > 0 ? (
          styles.map((style) => (
            <motion.div key={style.id} variants={itemVariants}>
              <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full group hover:-translate-y-1">
                <CardContent className="p-4 flex-grow flex flex-col">
                  <CardTitle className="text-xl font-headline mb-2">{style.name}</CardTitle>
                  <p className="text-foreground/90 mb-4 text-sm line-clamp-3 flex-grow">{style.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {style.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                  </div>
                </CardContent>
                <CardFooter className="p-4 bg-muted/50 flex justify-between items-center">
                  <p className="text-lg font-bold text-primary">¥{style.price}</p>
                  <Link href={`/commission/${encodeURIComponent(commissionName)}/${encodeURIComponent(style.name)}`} passHref>
                    <Button size="sm" disabled={!canApply} aria-disabled={!canApply}>
                      选择此样式 <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">暂无此委托类型下的细分样式。</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>返回上一页</Button>
          </div>
        )}
      </motion.div>
  );
}

