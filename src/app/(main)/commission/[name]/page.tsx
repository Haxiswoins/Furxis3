
'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { getCommissionOptionByName, getCommissionStylesByOptionId } from '@/lib/data-service';
import type { CommissionOption, CommissionStyle } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

function StyleCardSkeleton() {
  return (
    <Card className="overflow-hidden shadow-lg flex flex-col">
      <CardContent className="p-4 flex-grow">
        <Skeleton className="h-7 w-3/4 mb-2" />
        <Skeleton className="h-5 w-full mb-1" />
        <Skeleton className="h-5 w-5/6 mb-3" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16" />
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/50 flex justify-between items-center">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-10 w-24" />
      </CardFooter>
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

export default function CommissionStylePage() {
  const params = useParams();
  const router = useRouter();
  const [commissionOption, setCommissionOption] = useState<CommissionOption | null>(null);
  const [styles, setStyles] = useState<CommissionStyle[]>([]);
  const [loading, setLoading] = useState(true);

  const commissionName = decodeURIComponent(params.name as string);

  useEffect(() => {
    async function fetchData() {
      if (!commissionName) return;
      
      setLoading(true);
      try {
        const option = await getCommissionOptionByName(commissionName);
        if (option) {
          setCommissionOption(option);
          const fetchedStyles = await getCommissionStylesByOptionId(option.id);
          setStyles(fetchedStyles);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Failed to fetch commission data:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [commissionName]);

  const canApply = commissionOption?.status === '开放中' || commissionOption?.status === '即将开放';

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline">样式选择</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {loading ? <Skeleton className="h-6 w-80 mx-auto" /> : `请选择您感兴趣的具体样式`}
        </p>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {loading ? (
          [...Array(3)].map((_, i) => <StyleCardSkeleton key={i} />)
        ) : styles.length > 0 ? (
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
    </motion.div>
  );
}
