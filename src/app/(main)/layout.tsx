
import { AppShell } from './app-shell';

// This is now a Server Component again.
// It simply provides the AppShell, which will handle its own animations.
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
