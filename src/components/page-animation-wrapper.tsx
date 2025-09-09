
'use client';

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

export function PageAnimationWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            {/* 
              By wrapping children in a simple div with a key, we allow AnimatePresence to correctly
              detect when the page component changes. We remove the motion props from this wrapper
              to prevent animation conflicts with nested motion components within each page.
              The pages themselves are responsible for their own entry/exit animations.
              This solves the "flickering" or "double animation" issue.
            */}
            <div key={pathname}>
              {children}
            </div>
        </AnimatePresence>
    );
}
