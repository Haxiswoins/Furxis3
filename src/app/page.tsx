
'use client';

import { LandingPageClient } from '@/components/landing-client';
import { useState, useEffect } from 'react';

export default function WelcomePage() {
    // By changing the key, we force React to unmount the old component
    // and mount a new one, ensuring a clean state for the animation script.
    const [key, setKey] = useState(Date.now());

    // This is not strictly necessary for navigation TO this page, but can help
    // if we add any internal logic that might require a re-render.
    // For now, the main fix is the key itself forcing a new instance on navigation.

    return (
        <LandingPageClient key={key} />
    );
}
