
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { getCharactersBySeriesId, getCharacterSeriesByName, getSiteContent } from '@/lib/data-service';
import { notFound } from 'next/navigation';

export default async function AdoptionCharacterListPage({ params }: { params: { name: string } }) {
  const seriesName = decodeURIComponent(params.name as string);

  const [series, characters, content] = await Promise.all([
      getCharacterSeriesByName(seriesName),
      getCharactersBySeriesId((await getCharacterSeriesByName(seriesName))?.id || ''),
      getSiteContent()
  ]);
  
  if (!series) {
    notFound();
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline">{series?.name}</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          {series?.description || '给这些预先设计的角色一个家。'}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {characters.length > 0 ? (
          characters.map((char) => (
            <Card key={char.id} className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col text-sm">
              <CardHeader className="p-0">
                <Link href={`/adoption/${encodeURIComponent(seriesName)}/${encodeURIComponent(char.name)}`} passHref>
                  <div className="relative aspect-[3/4]">
                      <Image
                        src={char.imageUrl}
                        alt={char.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        style={{objectFit: 'cover'}}
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
                <p className="text-base font-bold text-primary">{char.price}</p>
                 <Link href={`/adoption/${encodeURIComponent(seriesName)}/${encodeURIComponent(char.name)}`} passHref>
                   <Button size="sm">
                    <Heart className="mr-1 h-3 w-3" /> 详情
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">该系列下暂无角色。</p>
          </div>
        )}
      </div>
    </div>
  );
}

    