'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import type { Character, CharacterSeries } from '@/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

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

type CharacterListPageClientProps = {
  series: CharacterSeries;
  characters: Character[];
}

function CharacterGrid({ characters, seriesName }: { characters: Character[]; seriesName: string; }) {

    return (
         <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {characters.map((char) => (
                <motion.div key={char.id} variants={itemVariants}>
                <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full group hover:-translate-y-1">
                    <CardHeader className="p-0">
                    <Link href={`/adoption/${encodeURIComponent(seriesName)}/${encodeURIComponent(char.name)}`} passHref>
                        <div className="relative aspect-[3/4] overflow-hidden">
                            <Image
                            src={char.imageUrl}
                            alt={char.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                            className={cn("object-cover transition-transform duration-500 group-hover:scale-105", char.status === '已领养' && 'grayscale')}
                            />
                        </div>
                    </Link>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow flex flex-col">
                    <CardTitle className="text-base md:text-lg font-headline mb-1">{char.name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">{char.species}</CardDescription>
                    <p className="text-foreground/80 my-3 text-xs line-clamp-3 flex-grow">{char.description}</p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                        {char.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                    </div>
                    </CardContent>
                    <CardFooter className="p-4 bg-muted/50 flex justify-between items-center">
                    <p className="text-base font-bold text-primary">¥{char.price}</p>
                    <Link href={`/adoption/${encodeURIComponent(seriesName)}/${encodeURIComponent(char.name)}`} passHref>
                        <Button size="sm" className={cn(char.status === '已领养' && "bg-gray-400 dark:bg-gray-600 hover:bg-gray-500 text-white cursor-pointer")}>
                            {char.status === '已领养' ? '查看详情' : <><Heart className="mr-2 h-4 w-4" /> 详情</>}
                        </Button>
                    </Link>
                    </CardFooter>
                </Card>
                </motion.div>
            ))}
        </motion.div>
    )
}

export function CharacterListPageClient({ series, characters }: CharacterListPageClientProps) {
  const availableCharacters = characters.filter(c => c.status !== '已领养');
  const adoptedCharacters = characters.filter(c => c.status === '已领养');

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="space-y-12"
    >
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-headline">{series?.name}</h1>
        <p className="mt-2 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto whitespace-pre-wrap">
          {series?.description || '给这些预先设计的角色一个家。'}
        </p>
      </div>

      {availableCharacters.length > 0 && (
          <div>
            <h2 className="text-2xl font-headline pl-4 border-l-4 border-primary mb-6">待领养</h2>
            <CharacterGrid characters={availableCharacters} seriesName={series.name} />
          </div>
      )}

      {adoptedCharacters.length > 0 && (
          <div>
            <h2 className="text-2xl font-headline pl-4 border-l-4 border-muted-foreground text-muted-foreground mb-6">已领养</h2>
            <CharacterGrid characters={adoptedCharacters} seriesName={series.name} />
          </div>
      )}
      
      {characters.length === 0 && (
        <div className="col-span-full text-center py-10">
          <p className="text-muted-foreground">该系列下暂无角色。</p>
        </div>
      )}
    </motion.div>
  );
}
