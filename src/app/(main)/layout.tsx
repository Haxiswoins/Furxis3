
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

  // siteContent is passed down as a prop
  // Removed the extra div wrapper that was causing a black flash on page transitions.
  return (
    <AppShell siteContent={siteContent}>
        {children}
    </AppShell>
  );
}
