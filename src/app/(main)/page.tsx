
'use client';

import { LandingPageClient } from '@/components/landing-client';
import { useState } from 'react';

export default function WelcomePage() {
    // By changing the key, we force React to unmount the old component
    // and mount a new one, ensuring a clean state for the animation script.
    const [key, setKey] = useState(Date.now());

    return (
        <LandingPageClient key={key} />
    );
}
