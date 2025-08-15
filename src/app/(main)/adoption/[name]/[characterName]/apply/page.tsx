
import { notFound } from 'next/navigation';
import type { Character, SiteContent } from '@/types';
import { getCharacterByName, getSiteContent, createAdoptionApplication } from '@/lib/data-service';
import { AdoptionApplicationForm } from './form-client';

export const dynamic = 'force-dynamic';

export default async function AdoptionApplyPage({ params }: { params: { characterName: string } }) {
  const characterName = decodeURIComponent(params.characterName as string);

  if (!characterName) {
    notFound();
  }

  const [character, siteContent] = await Promise.all([
    getCharacterByName(characterName),
    getSiteContent(),
  ]);

  if (!character) {
    notFound();
  }
  
  // Bind the server action with the character object on the server.
  const createAdoptionApplicationWithCharacter = createAdoptionApplication.bind(null, character);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <AdoptionApplicationForm
        character={character}
        siteContent={siteContent}
        createAdoptionApplication={createAdoptionApplicationWithCharacter}
      />
    </div>
  );
}
