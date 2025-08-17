
import { notFound } from 'next/navigation';
import type { Character, SiteContent } from '@/types';
import { getCharacterByName, getSiteContent } from '@/lib/data-service';
import { AdoptionApplicationFormClient } from './form-client';

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
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <AdoptionApplicationFormClient
        character={character}
        siteContent={siteContent}
      />
    </div>
  );
}
