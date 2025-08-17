'use client';

import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { getCharacterByName } from '@/lib/data-service';
import { CharacterDetailClient, Images } from './client-page';
import type { Character } from '@/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdoptionDetailPage() {
  const params = useParams();
  const characterName = decodeURIComponent(params.characterName as string);
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!characterName) {
      notFound();
      return;
    }
    setLoading(true);
    getCharacterByName(characterName).then(data => {
      if (!data) {
        notFound();
      } else {
        setCharacter(data);
        setLoading(false);
      }
    });
  }, [characterName]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="sticky top-24 space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="aspect-square w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!character) {
    notFound();
    return null;
  }

  const characterImages = [
    character.imageUrl,
    character.imageUrl1,
    character.imageUrl2,
    character.imageUrl3,
    character.imageUrl4
  ].filter(Boolean) as string[];

  return (
    <div
        className="max-w-5xl mx-auto"
    >
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="sticky top-24">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-4xl font-headline">{character.name}</CardTitle>
                <CardDescription className="text-lg text-muted-foreground pt-1">{character.species}</CardDescription>
              </CardHeader>
              <p className="text-foreground/90 mb-4 whitespace-pre-wrap">{character.description}</p>
              <div className="text-sm text-muted-foreground mb-6">
                <span className="font-semibold">{character.applicants}</span> 人已申请
              </div>
              <CardFooter className="p-0">
                <CharacterDetailClient character={character} />
              </CardFooter>
            </div>
            <Images images={characterImages} name={character.name} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
