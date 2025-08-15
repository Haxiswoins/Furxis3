import { getCharacters } from '@/lib/data-service';
import { AdminCharactersClient } from './client-page';

export default async function AdminCharactersPage() {
  const characters = await getCharacters();
  
  return (
    <AdminCharactersClient characters={characters} />
  );
}
