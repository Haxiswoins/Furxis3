import { getSiteContent } from '@/lib/data-service';
import { AppShell } from './app-shell';
import { PageAnimationWrapper } from '@/components/page-animation-wrapper';

// This is now a Server Component
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Data is fetched on the server
  const siteContent = await getSiteContent();

  return (
    // siteContent is passed down as a prop
    <AppShell siteContent={siteContent}>
      <PageAnimationWrapper>
        {children}
      </PageAnimationWrapper>
    </AppShell>
  );
}
