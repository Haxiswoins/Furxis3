

import { getCharacters } from '@/lib/data-service';
import { AdminCharactersClient } from './client-page';

export const dynamic = 'force-dynamic';

export default async function AdminCharactersPage() {
    const charactersData = await getCharacters();
    return <AdminCharactersClient characters={charactersData} />
}
