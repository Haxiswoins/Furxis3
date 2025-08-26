
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { AppShell } from './app-shell';

// This is now a Client Component to handle animations.
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    // The AppShell now only contains layout, not animation logic.
    <AppShell>
      {/* 
        This is the CORRECT place for AnimatePresence.
        It wraps the changing page content ({children}),
        while the parent layout (AppShell) remains static.
      */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
