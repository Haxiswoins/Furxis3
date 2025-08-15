
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { getCharacterByName } from '@/lib/data-service';
import { CharacterDetailClient, Images } from './client-page';

export default async function AdoptionDetailPage({ params }: { params: { name: string, characterName: string }}) {
  const characterName = decodeURIComponent(params.characterName as string);

  const character = await getCharacterByName(characterName);

  if (!character) {
    notFound();
  }

  const characterImages = [
    character.imageUrl,
    character.imageUrl1,
    character.imageUrl2,
    character.imageUrl3,
    character.imageUrl4
  ].filter(Boolean) as string[];

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="sticky top-24">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-4xl font-headline">{character.name}</CardTitle>
                <CardDescription className="text-lg text-muted-foreground pt-1">{character.species}</CardDescription>
              </CardHeader>
              <p className="text-foreground/90 mb-4">{character.description}</p>
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
