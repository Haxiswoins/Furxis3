import { getSiteContent } from '@/lib/data-service';
import ContentClientPage from './client-page';

export default async function SiteContentPage() {
    const initialContent = await getSiteContent();

    return (
        <div>
            <h1 className="text-3xl font-headline mb-6">网站内容管理</h1>
            <p className="text-muted-foreground mb-8">在这里修改网站的全局内容，例如首页的卡片信息和列表页的描述。</p>
            <ContentClientPage initialContent={initialContent} />
        </div>
    );
}
