import { getSiteContent } from '@/lib/data-service';
import { AppShell } from './app-shell';

// This is now a Server Component
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Data is fetched on the server
  const siteContent = await getSiteContent();

  return (
    // AppShell wraps all pages in the (main) group
    <AppShell siteContent={siteContent}>
        {children}
    </AppShell>
  );
}
