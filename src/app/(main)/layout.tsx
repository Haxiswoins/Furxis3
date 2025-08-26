
'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from './app-shell';
import { getSiteContent } from '@/lib/data-service';
import { useEffect, useState } from 'react';
import type { SiteContent } from '@/types';

// This must be a client component to use hooks like usePathname and for AnimatePresence to work correctly.
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    // Data fetching happens on the client side now
    getSiteContent().then(setSiteContent);
  }, []);

  return (
    <AppShell siteContent={siteContent}>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
