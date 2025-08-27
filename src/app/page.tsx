
'use client';

import { useRouter } from 'next/navigation';
import { LandingPageClient } from '@/components/landing-client';


export default function WelcomePage() {
    const router = useRouter();

    const handleNavigate = () => {
        router.push('/home');
    };

    return (
        <LandingPageClient />
    );
}
