
'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { getCharactersBySeriesId, getCharacterSeriesByName } from '@/lib/data-service';
import type { Character, CharacterSeries } from '@/types';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

function CharacterCardSkeleton() {
    return (
        <Card className="overflow-hidden shadow-lg flex flex-col text-sm">
            <CardHeader className="p-0">
                <div className="relative aspect-[3/4] bg-muted">
                    <Skeleton className="w-full h-full" />
                </div>
            </CardHeader>
            <CardContent className="p-3 flex-grow">
                <Skeleton className="h-6 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-10 w-full mb-3" />
                <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-16" />
                </div>
            </CardContent>
            <CardFooter className="p-3 bg-muted/50 flex justify-between items-center">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-9 w-24" />
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

export default function AdoptionCharacterListPage() {
  const params = useParams();
  const seriesName = decodeURIComponent(params.name as string);

  const [series, setSeries] = useState<CharacterSeries | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seriesName) {
      notFound();
      return;
    }
    
    setLoading(true);
    getCharacterSeriesByName(seriesName).then(seriesData => {
      if (!seriesData) {
        notFound();
        return;
      }
      setSeries(seriesData);
      getCharactersBySeriesId(seriesData.id).then(characterData => {
        setCharacters(characterData);
        setLoading(false);
      });
    });
  }, [seriesName]);

  if (loading) {
    return (
        <div>
            <div className="text-center mb-12">
                <Skeleton className="h-10 w-48 mx-auto" />
                <Skeleton className="h-6 w-96 mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => <CharacterCardSkeleton key={i} />)}
            </div>
        </div>
    );
  }

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline">{series?.name}</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          {series?.description || '给这些预先设计的角色一个家。'}
        </p>
      </div>
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {characters.length > 0 ? (
          characters.map((char) => (
            <motion.div key={char.id} variants={itemVariants}>
                <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col text-sm h-full group hover:-translate-y-1">
                <CardHeader className="p-0">
                    <Link href={`/adoption/${encodeURIComponent(seriesName)}/${encodeURIComponent(char.name)}`} passHref>
                    <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                            src={char.imageUrl}
                            alt={char.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                            style={{objectFit: 'cover'}}
                            className="transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                    </Link>
                </CardHeader>
                <CardContent className="p-3 flex-grow">
                    <CardTitle className="text-lg font-headline mb-1 truncate">{char.name}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mb-2">{char.species}</CardDescription>
                    <p className="text-foreground/80 mb-3 text-xs line-clamp-2">{char.description}</p>
                    <div className="flex flex-wrap gap-1">
                    {char.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                    </div>
                </CardContent>
                <CardFooter className="p-3 bg-muted/50 flex justify-between items-center">
                    <p className="text-base font-bold text-primary">¥{char.price}</p>
                    <Link href={`/adoption/${encodeURIComponent(seriesName)}/${encodeURIComponent(char.name)}`} passHref>
                    <Button size="sm">
                        <Heart className="mr-1 h-3 w-3" /> 详情
                    </Button>
                    </Link>
                </CardFooter>
                </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">该系列下暂无角色。</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
