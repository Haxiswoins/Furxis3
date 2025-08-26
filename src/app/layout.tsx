
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Playfair_Display, Noto_Serif_SC, Noto_Sans_SC } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AppShell } from './(main)/app-shell';
import { getSiteContent } from '@/lib/data-service';

export const metadata: Metadata = {
  title: 'Suitopia',
  description: 'A platform for Fursuit commissions and adoptions.',
};

const fontHeadline = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
});

const fontSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-serif-sc',
  display: 'swap',
});

const fontBody = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700'],
  variable: '--font-body',
  display: 'swap',
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteContent = await getSiteContent();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "font-body antialiased loading-initial",
        fontHeadline.variable,
        fontSerifSC.variable,
        fontBody.variable
      )}>
          <ThemeProvider>
            <AuthProvider>
              <AppShell siteContent={siteContent}>
                {children}
              </AppShell>
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
      </body>
    </html>
  );
}
