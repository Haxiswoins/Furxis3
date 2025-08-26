
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Playfair_Display, Noto_Serif_SC, Noto_Sans_SC } from 'next/font/google';
import { cn } from '@/lib/utils';
import Script from 'next/script';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "font-body antialiased",
        fontHeadline.variable,
        fontSerifSC.variable,
        fontBody.variable
      )}>
        <div id="fluid-bg-container" className="fixed inset-0 z-0 pointer-events-none"></div>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
        <Script src="/AestheticFluidBg.min.js" strategy="afterInteractive" />
        <Script id="init-fluid-bg" strategy="afterInteractive">
          {`
            new Color4Bg.AestheticFluidBg({
              dom: "fluid-bg-container",
              colors: ["#ff5900","#ffffff","#305797","#ffffff","#ffffff","#f5fffe"],
              loop: true
            });
          `}
        </Script>
      </body>
    </html>
  );
}
