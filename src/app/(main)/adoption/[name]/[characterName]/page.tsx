
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { getCharacterByName } from '@/lib/data-service';
import { CharacterDetailClient, Images } from './client-page';
import type { Character } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdoptionDetailPage({ params }: { params: { characterName: string } }) {
  
  const characterName = decodeURIComponent(params.characterName as string);

  if (!characterName) {
    return notFound();
  }

  const character = await getCharacterByName(characterName);

  if (!character) {
    return notFound();
  }

  const characterImages = [
    character.imageUrl,
    character.imageUrl1,
    character.imageUrl2,
    character.imageUrl3,
    character.imageUrl4
  ].filter((url): url is string => !!url);

  return (
    <div
        className="container max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl font-headline">{character.name}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground pt-1">{character.species}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 mb-4 whitespace-pre-wrap">{character.description}</p>
              <div className="text-sm text-muted-foreground mb-6">
                <span className="font-semibold">{character.applicants}</span> 人已申请
              </div>
            </CardContent>
            <CardFooter>
              <CharacterDetailClient character={character} />
            </CardFooter>
          </Card>
        </div>
        <div className="lg:col-span-2">
            <Images images={characterImages} name={character.name} />
        </div>
      </div>
    </div>
  );
}
