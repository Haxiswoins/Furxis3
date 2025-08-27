
'use client';

import { LandingPageClient } from '@/components/landing-client';
import { useTheme } from '@/context/ThemeContext';

export default function WelcomePage() {
    const { theme } = useTheme();

    // The key ensures that if for some reason this component re-renders,
    // the LandingPageClient is re-mounted, which is good for animation scripts.
    // The main fix for the flash is inside LandingPageClient, which now waits
    // for a non-null theme before rendering anything.
    // By returning null here when theme is not ready, we provide an extra layer of protection.
    if (!theme) {
        return null; // Render nothing until the theme is determined.
    }
    
    return (
        <LandingPageClient key={theme} />
    );
}
