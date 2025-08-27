
'use client';

import { useRouter } from 'next/navigation';
import { FluidBackground } from '@/components/fluid-background';
import { LandingPageClient } from '@/components/landing-client';

export default function WelcomePage() {
    const router = useRouter();

    const handleNavigate = () => {
        router.push('/home');
    };

    return (
        <div className="relative min-h-screen w-full bg-background">
            <FluidBackground />
            <LandingPageClient onNavigate={handleNavigate} />
        </div>
    );
}
