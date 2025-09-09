
import { getCharacters } from '@/lib/data-service';
import type { Character } from '@/types';
import { AdminCharactersClient } from './client-page';

export const dynamic = 'force-dynamic';

export default async function AdminCharactersPage() {
  const fetchedCharacters = await getCharacters();
  // Sort by creation time (desc) using the timestamp in the ID
  const sorted = fetchedCharacters.sort((a, b) => {
      const timeA = parseInt(a.id.split('_')[1] || '0');
      const timeB = parseInt(b.id.split('_')[1] || '0');
      return timeB - timeA;
  });

  return (
    <AdminCharactersClient characters={sorted} />
  );
}
