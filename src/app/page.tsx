// The welcome page is now a Server Component by default.
// This helps prevent the "flash" of incorrect content or themes by ensuring
// the initial render from the server is as complete as possible.
// The actual client-side interactivity is encapsulated in LandingPageClient.

import { LandingPageClient } from '@/components/landing-client';

export default function WelcomePage() {
    return (
        <LandingPageClient />
    );
}
