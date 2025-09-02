
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import type { Character, CharacterSeries } from '@/types';
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

type CharacterListPageClientProps = {
  series: CharacterSeries;
  characters: Character[];
}

export function CharacterListPageClient({ series, characters }: CharacterListPageClientProps) {
  const seriesName = series.name;
  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline">{series?.name}</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto whitespace-pre-wrap">
          {series?.description || '给这些预先设计的角色一个家。'}
        </p>
      </div>
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {characters.length > 0 ? (
          characters.map((char) => (
            <motion.div key={char.id} variants={itemVariants}>
                <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row h-full group hover:-translate-y-1">
                    {/* Image Section */}
                    <div className="md:w-1/3 w-full relative aspect-[3/4] overflow-hidden flex-shrink-0">
                         <Link href={`/adoption/${encodeURIComponent(seriesName)}/${encodeURIComponent(char.name)}`} passHref>
                            <Image
                                src={char.imageUrl}
                                alt={char.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                style={{objectFit: 'cover'}}
                                className="transition-transform duration-500 group-hover:scale-105"
                            />
                        </Link>
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex flex-col flex-grow">
                        <CardContent className="p-4 flex-grow">
                            <CardTitle className="text-xl font-headline mb-1 truncate">{char.name}</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground mb-2">{char.species}</CardDescription>
                            <p className="text-foreground/80 mb-3 text-sm line-clamp-3 md:line-clamp-4">{char.description}</p>
                            <div className="flex flex-wrap gap-1.5">
                            {char.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 bg-muted/50 flex justify-between items-center mt-auto">
                            <p className="text-lg font-bold text-primary">¥{char.price}</p>
                            <Link href={`/adoption/${encodeURIComponent(seriesName)}/${encodeURIComponent(char.name)}`} passHref>
                            <Button size="sm">
                                <Heart className="mr-1 h-3 w-3" /> 详情
                            </Button>
                            </Link>
                        </CardFooter>
                    </div>
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
