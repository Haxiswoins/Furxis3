
import { getCharacters } from '@/lib/data-service';
import { AdminCharactersClient } from './client-page';
import type { Character } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminCharactersPage() {
  const characters = await getCharacters();

  const sorted = characters.sort((a,b) => {
    const timeA = parseInt(a.id.split('_')[1] || '0');
    const timeB = parseInt(b.id.split('_')[1] || '0');
    return timeB - timeA;
  });

  return <AdminCharactersClient characters={sorted} />;
}
