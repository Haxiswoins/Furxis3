
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSiteContent } from '@/lib/data-service';

// This is now a Server Component
export default async function PrivacyPolicyPage() {
    const siteContent = await getSiteContent();
    const policyText = siteContent?.privacyPolicyText || "隐私政策正在加载中...";
    const lastUpdated = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">隐私政策</CardTitle>
          <p className="text-muted-foreground pt-2">更新日期: {lastUpdated}</p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
            {/* The content is now dynamically rendered */}
            <div dangerouslySetInnerHTML={{ __html: policyText.replace(/\n/g, '<br />') }} />
        </CardContent>
      </Card>
    </div>
  );
}
