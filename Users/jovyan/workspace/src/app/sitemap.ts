import { MetadataRoute } from 'next';
import { getWorks } from './lib/data-service';
import { getCharacterSeries } from './lib/data-service';
import { getCharacters } from './lib/data-service';
import { getCommissionOptions } from './lib/data-service';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    
    // 1. Get static pages
    const staticRoutes = [
        '',
        '/home',
        '/commission',
        '/adoption',
        '/works',
        '/profile',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
    }));

    // 2. Get dynamic commission pages
    const commissionOptions = await getCommissionOptions();
    const commissionRoutes = commissionOptions.map((option) => ({
        url: `${BASE_URL}/commission/${encodeURIComponent(option.name)}`,
        lastModified: new Date(option.commissionDate),
    }));

    // 3. Get dynamic adoption series pages
    const characterSeries = await getCharacterSeries();
    const adoptionSeriesRoutes = characterSeries.map((series) => ({
        url: `${BASE_URL}/adoption/${encodeURIComponent(series.name)}`,
        lastModified: new Date(),
    }));
    
    // 4. Get dynamic adoption character detail pages
    const characters = await getCharacters();
    const adoptionCharacterRoutes = await Promise.all(characters.map(async (character) => {
        const series = characterSeries.find(s => s.id === character.seriesId);
        const seriesName = series ? series.name : '';
        return {
            url: `${BASE_URL}/adoption/${encodeURIComponent(seriesName)}/${encodeURIComponent(character.name)}`,
            lastModified: new Date(),
        };
    }));
    
    // 5. Get dynamic works pages
    const works = await getWorks();
    const workRoutes = works.map((work) => ({
        url: `${BASE_URL}/works/${work.id}`,
        lastModified: new Date(work.completionDate),
    }));

    return [
        ...staticRoutes,
        ...commissionRoutes,
        ...adoptionSeriesRoutes,
        ...adoptionCharacterRoutes,
        ...workRoutes,
    ];
}
