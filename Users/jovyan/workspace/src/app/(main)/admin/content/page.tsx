
import { getSiteContent } from '@/lib/data-service';
import { ContentClientPage } from './client-page';

export const dynamic = 'force-dynamic';

export default async function SiteContentAdminPage() {
    const siteContent = await getSiteContent();
    return <ContentClientPage initialContent={siteContent} />
}

    