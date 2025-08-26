
'use client';

import { useRouter } from 'next/navigation';
import { FluidBackground } from '@/components/fluid-background';
import { LandingPageClient } from '@/components/landing-client';
import Header from '@/components/header';

export default function WelcomePage() {
    const router = useRouter();

    const handleNavigate = () => {
        router.push('/home');
    };

    return (
        <div className="relative min-h-screen w-full bg-background">
            <FluidBackground />
            <Header />
            <LandingPageClient onNavigate={handleNavigate} />
        </div>
    );
}
