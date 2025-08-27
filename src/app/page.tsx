
'use client';

import { LandingPageClient } from '@/components/landing-client';
import { useTheme } from '@/context/ThemeContext';

export default function WelcomePage() {
    const { theme } = useTheme();

    // Do not render the landing page until the theme has been determined.
    // This prevents any flicker or flash of unstyled/incorrectly styled content.
    if (!theme) {
        return null;
    }

    // By passing the theme as a key, we force React to re-mount the component
    // when the theme changes, ensuring a clean state for the animation script.
    return (
        <LandingPageClient key={theme} />
    );
}
