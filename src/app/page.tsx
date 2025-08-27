
'use client';

import { LandingPageClient } from '@/components/landing-client';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function WelcomePage() {
    // By changing the key, we force React to unmount the old component
    // and mount a new one, ensuring a clean state for the animation script.
    const [key, setKey] = useState(Date.now());
    const { theme } = useTheme();

    // Do not render the landing page until the theme has been determined.
    // This prevents any flicker or flash of unstyled/incorrectly styled content.
    if (!theme) {
        return null;
    }

    return (
        <LandingPageClient key={key} />
    );
}
